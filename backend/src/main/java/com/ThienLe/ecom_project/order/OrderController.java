package com.ThienLe.ecom_project.order;

import com.ThienLe.ecom_project.order.dto.CheckoutRequest;
import com.ThienLe.ecom_project.payment.VNPayUtil;
import com.ThienLe.ecom_project.payment.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor // CHUẨN MODULAR: Tự động inject qua constructor cho các biến "final"
@CrossOrigin
public class OrderController {

    private final OrderService orderService;
    private final VNPayService vnPayService;
    
    // CHUẨN MODULAR: Đã bóc tách hoàn toàn, KHÔNG inject UserRepo sang đây nữa!

    @GetMapping
    public ResponseEntity<?> getOrdersByUser(Principal principal) {
        String currentUsername = principal.getName();
        
        // CHUẨN MODULAR: Gọi trực tiếp qua Service bằng username phẳng
        List<Order> userOrders = orderService.getOrdersByUsername(currentUsername);
        return ResponseEntity.ok(userOrders);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> allOrders = orderService.getAllOrdersForAdmin();
            return ResponseEntity.ok(allOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách toàn bộ đơn hàng: " + e.getMessage());
        }
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            Principal principal,
            @RequestBody CheckoutRequest request
    ) throws UnsupportedEncodingException {
        String currentUsername = principal.getName();
        
        // CHUẨN MODULAR: Khớp hoàn toàn với hàm checkout(String username, CheckoutRequest request) của OrderService
        Object checkoutResult = orderService.checkout(currentUsername, request);
        return ResponseEntity.ok(checkoutResult);
    }

    @PostMapping("/create-vnpay-payment")
    public ResponseEntity<?> createPayment(
            @RequestParam long amount,
            @RequestParam String orderId,
            HttpServletRequest request) throws Exception {

        String paymentUrl = vnPayService.createPaymentUrl(
            amount, orderId, VNPayUtil.getIpAddress(request)
        );
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(
            @RequestParam("vnp_ResponseCode") String responseCode,
            @RequestParam("vnp_TxnRef") Long orderId
    ) {
        orderService.handleVnpayReturn(responseCode, orderId);
        return ResponseEntity.ok("Payment result processed");
    }
}
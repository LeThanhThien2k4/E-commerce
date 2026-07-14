package com.ThienLe.ecom_project.order;

import com.ThienLe.ecom_project.product.ProductService;
import com.ThienLe.ecom_project.cart.CartService;
import com.ThienLe.ecom_project.user.UserService;
import com.ThienLe.ecom_project.order.dto.CheckoutRequest;
import com.ThienLe.ecom_project.cart.dto.CartItemDto; // Giả định dùng DTO để nhận dữ liệu từ mô-đun Cart
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.HmacUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    // CHUẨN MODULAR: Giao tiếp với mô-đun khác thông qua Service Layer của họ, không inject Repo bừa bãi
    private final UserService userService;       // Từ mô-đun user
    private final ProductService productService; // Từ mô-đun product
    private final CartService cartService;       // Từ mô-đun cart

    // ================== PUBLIC API FOR CONTROLLER ==================

    public Object checkout(String username, CheckoutRequest request) throws UnsupportedEncodingException {
        // 1. Hỏi mô-đun User lấy ID từ username
        Long userId = userService.findIdByUsername(username);

        // 2. Gọi mô-đun Cart lấy thông tin các item cần checkout (trả về DTO chứa id, productId, quantity, price)
        List<CartItemDto> cartItems = cartService.getCartItemsForCheckout(request.getCartItemIds());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống hoặc không hợp lệ");
        }

        // 3. Gọi mô-đun Product kiểm tra kho (Bóc tách logic Validate ra khỏi Order)
        productService.validateProductsStock(cartItems);

        // 4. Tính tổng tiền từ DTO
        BigDecimal totalPrice = calculateTotalPrice(cartItems);

        // 5. Tạo đơn hàng (Chỉ lưu userId)
        Order order = createOrder(userId, request, totalPrice);

        // 6. Tạo danh sách item thuộc đơn hàng (Chỉ lưu productId)
        List<OrderItem> orderItems = createOrderItems(order, cartItems);
        orderItemRepository.saveAll(orderItems);

        // 7. Gọi mô-đun Cart xóa các item đã mua
        cartService.clearCartItems(request.getCartItemIds());

        // 8. Xử lý thanh toán
        return handlePayment(order, cartItems, request.getPaymentMethod());
    }

    public void handleVnpayReturn(String responseCode, Long orderId) {
        Order order = findOrderById(orderId);

        if ("00".equals(responseCode)) {
            markOrderPaid(order);
            // CHUẨN MODULAR: Ủy quyền trừ kho sang cho ProductService xử lý bằng Product ID
            Map<Long, Integer> productQuantities = new HashMap<>();
            for (OrderItem item : order.getItems()) {
                productQuantities.put(item.getProductId(), item.getQuantity());
            }
            
            productService.deductStockFromOrder(productQuantities);
        } else {
            markOrderCancelled(order);
        }

        orderRepository.save(order);
    }

    public List<Order> getOrdersByUsername(String username) {
        Long userId = userService.findIdByUsername(username);
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrdersForAdmin() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // ================== PRIVATE HELPER METHODS ==================

    private BigDecimal calculateTotalPrice(List<CartItemDto> cartItems) {
        return cartItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Order createOrder(Long userId, CheckoutRequest request, BigDecimal totalPrice) {
        Order order = new Order();
        order.setUserId(userId); // Không truyền cả cục Entity Users vào nữa
        order.setTotalPrice(totalPrice);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setShippingAddress(request.getShippingAddress());
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private List<OrderItem> createOrderItems(Order order, List<CartItemDto> cartItems) {
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemDto item : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProductId()); // Lưu ID thay vì Product Entity
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItems.add(orderItem);
        }
        return orderItems;
    }

    private Object handlePayment(Order order, List<CartItemDto> cartItems, PaymentMethod method) throws UnsupportedEncodingException {
        if (method == PaymentMethod.COD) {
            // Nếu là COD thì trừ kho ngay lập tức
            productService.deductStockFromCart(cartItems);
            markOrderPaid(order);
            return "ORDER_SUCCESS";
        }

        if (method == PaymentMethod.VNPAY) {
            return buildVnpayUrl(order);
        }
        return order;
    }

    private void markOrderPaid(Order order) {
        order.setOrderStatus(OrderStatus.PAID);
    }

    private void markOrderCancelled(Order order) {
        order.setOrderStatus(OrderStatus.CANCELLED);
    }

    private Order findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + id));
    }

    // Giữ nguyên hàm buildVnpayUrl của bạn (tạm thời để tại đây, sau này có thể bốc sang module config/payment)
    private String buildVnpayUrl(Order order) throws UnsupportedEncodingException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan don hang " + order.getId();
        String orderType = "other";
        String vnp_TxnRef = String.valueOf(order.getId());
        String vnp_IpAddr = "127.0.0.1";
        String vnp_TmnCode = "6I9CHY8W";
        String vnp_HashSecret = "MD3PCHCB1O7G0LRYY6ICFNMVDLRKHOET";
        
        long amount = order.getTotalPrice().longValue() * 100;
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", "http://localhost:5173/payment-return");
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = new HmacUtils("HmacSHA512", vnp_HashSecret).hmacHex(hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + queryUrl;
    }
}
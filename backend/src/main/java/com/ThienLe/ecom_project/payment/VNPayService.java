package com.ThienLe.ecom_project.payment;

import com.ThienLe.ecom_project.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig config;

    public String createPaymentUrl(long amount, String orderId, String ipAddress) throws Exception {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.tmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY tính theo đơn vị x100
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.returnUrl);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", VNPayUtil.getCurrentDateTime());

        // Tạo chuỗi hash
        String queryString = params.entrySet().stream()
            .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));

        String secureHash = VNPayUtil.hmacSHA512(config.hashSecret, queryString);

        return config.paymentUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyReturn(Map<String, String> params) throws Exception {
        String receivedHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String queryString = new TreeMap<>(params).entrySet().stream()
            .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));

        String expectedHash = VNPayUtil.hmacSHA512(config.hashSecret, queryString);
        return expectedHash.equalsIgnoreCase(receivedHash);
    }
}
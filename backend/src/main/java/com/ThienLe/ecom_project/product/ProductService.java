package com.ThienLe.ecom_project.product;

import com.ThienLe.ecom_project.cart.dto.CartItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor // CHUẨN MODULAR: Bỏ @Autowired
public class ProductService {

    private final ProductRepo repo;

    // --- CÁC HÀM MỚI PHỤC VỤ CHO MÔ-ĐUN ORDER ---

    public boolean existsById(Long id) {
        return repo.existsById(id);
    }

    // 2. Lấy số lượng hàng còn lại trong kho để giỏ hàng validate chặn tham lam
    public int getProductAvailableStock(Long id) {
        return repo.findById(id)
                .map(Product::getQuantity) // Hàm getQuantity() có sẵn trong Entity Product của bạn
                .orElse(0);
    }

    // 3. Lấy giá bán thực tế của sản phẩm để mô-đun Cart/Order tính tiền
    public java.math.BigDecimal getProductPrice(Long id) {
        return repo.findById(id)
                .map(Product::getPrice) // Hàm getPrice() có sẵn trong Entity Product của bạn
                .orElse(java.math.BigDecimal.ZERO);
    }
    // 1. Kiểm tra hàng trong kho xem đủ số lượng không
    public void validateProductsStock(List<CartItemDto> cartItems) {
        for (CartItemDto item : cartItems) {
            Product product = repo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + item.getProductId()));
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm đã hết hàng hoặc không đủ số lượng: " + product.getName());
            }
        }
    }

    // 2. Trừ kho trực tiếp (Dùng cho phương thức COD)
    public void deductStockFromCart(List<CartItemDto> cartItems) {
        for (CartItemDto item : cartItems) {
            Product product = repo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            
            int newQuantity = product.getQuantity() - item.getQuantity();
            if (newQuantity < 0) {
                throw new RuntimeException("Số lượng tồn kho không đủ: " + product.getName());
            }
            product.setQuantity(newQuantity);
            repo.save(product);
        }
    }

    // 3. Trừ kho từ danh sách Item ID/Quantity (Dùng cho VNPay Return thành công)
    // Để tránh ProductService import ngược Entity Order, ta nhận trực tiếp Map<productId, quantity>
    public void deductStockFromOrder(Map<Long, Integer> productQuantities) {
        productQuantities.forEach((productId, quantity) -> {
            Product product = repo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            int newQuantity = product.getQuantity() - quantity;
            if (newQuantity < 0) {
                throw new RuntimeException("Số lượng tồn kho không đủ để hoàn tất đơn: " + product.getName());
            }
            product.setQuantity(newQuantity);
            repo.save(product);
        });
    }

    // --- CÁC HÀM CŨ GIỮ NGUYÊN ---
    public List<Product> getAllProducts() { return repo.findAll(); }
    public Product getProduct(Long id) { return repo.findProductWithSpecs(id).orElse(null); }
    public void deleteProduct(Long id) { repo.deleteById(id); }
    public List<Product> searchProducts(String keyword) { return repo.searchProducts(keyword); }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
        if (product.getSpecifications() != null) {
            product.getSpecifications().forEach(spec -> spec.setProduct(product));
        }
        return repo.save(product);
    }

    public Product updateProduct(Long id, Product product, MultipartFile imageFile) throws IOException {
        Product existingProduct = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setReleaseDate(product.getReleaseDate());
        existingProduct.setAvailable(product.isAvailable());

        if (imageFile != null && !imageFile.isEmpty()) {
            existingProduct.setImageData(imageFile.getBytes());
            existingProduct.setImageName(imageFile.getOriginalFilename());
            existingProduct.setImageType(imageFile.getContentType());
        }

        existingProduct.getSpecifications().clear();
        if (product.getSpecifications() != null) {
            for (ProductSpecification spec : product.getSpecifications()) {
                spec.setProduct(existingProduct);
                existingProduct.getSpecifications().add(spec);
            }
        }
        return repo.save(existingProduct);
    }
}
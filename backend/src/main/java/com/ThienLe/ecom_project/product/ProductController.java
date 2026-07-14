package com.ThienLe.ecom_project.product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductService service;


    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {

        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = service.getProduct(id);
        if (product != null) {
            return new ResponseEntity<>(product, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/product")
    public ResponseEntity<?> addProduct(@RequestPart Product product, @RequestPart MultipartFile imageFile) {
        try {
            Product product1 = service.addProduct(product, imageFile);
            return new ResponseEntity<>(product1, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable Long productId) {
        Product product = service.getProduct(productId);
        if (product != null && product.getImageData() != null) {
            return new ResponseEntity<>(product.getImageData(), HttpStatus.OK);
        } else {
            // Trả về lỗi 404 nếu không tìm thấy sản phẩm hoặc ảnh
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProductById(@PathVariable Long id,
                                                    @RequestPart Product product,
                                                    @RequestPart MultipartFile imageFile){
        Product product1 = null;
        try {
            product1 = service.updateProduct(id, product, imageFile);
        } catch (IOException e) {
            return new ResponseEntity<>("Fail to Update",HttpStatus.BAD_REQUEST);
        }
        if(product1 != null){
            return new ResponseEntity<>("Updated", HttpStatus.OK);
        }else{
            return new ResponseEntity<>("Fail to Update",HttpStatus.BAD_REQUEST);
        }
    }
    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id){
        Product product = service.getProduct(id);
        if(product != null){
            service.deleteProduct(id);
            return new ResponseEntity<>("Deleted", HttpStatus.OK);
        }else{
            return new ResponseEntity<>("Fail to Delete", HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(String keyword){
        System.out.println("searching with :" + keyword);
        List<Product> products = service.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

}
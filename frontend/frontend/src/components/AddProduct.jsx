import React, { useState, useContext } from "react";
import API from "../axios.jsx";
import AppContext from "../context/Context";

const AddProduct = () => {
  const { data } = useContext(AppContext);
  const categories = data && data.length > 0 
    ? [...new Set(data.map(p => p.category))].filter(Boolean) 
    : ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    releaseDate: "",
    available: false,
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    // setProduct({...product, image: e.target.files[0]})
  };

 const submitHandler = async (e) => {
   e.preventDefault();

   try {
      const productWithSpecs = {
        ...product,
        specifications: specs // Phải trùng tên 'specifications' với bên Backend
      };
      const formData = new FormData();
      
      // BẮT BUỘC: Phải append dữ liệu vào formData
      // Lưu ý: Tên 'product' và 'imageFile' phải khớp chính xác với @RequestPart bên Spring Boot

      formData.append(
        "product",
        new Blob([JSON.stringify(productWithSpecs)], { type: "application/json" })
      );
      formData.append("imageFile", image); 

     
      const response = await API.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        alert("Thêm sản phẩm thành công!");
        // Reset form nếu cần
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại!");
      } else {
        alert("Có lỗi xảy ra khi thêm sản phẩm!");
      }
    }
  };
  const [specs, setSpecs] = useState([{ specKey: "", specValue: "", groupName: "Cấu hình" }]);

  const handleSpecChange = (index, e) => {
    const newSpecs = [...specs];
    newSpecs[index][e.target.name] = e.target.value;
    setSpecs(newSpecs);
  };

  const addSpecField = () => {
    setSpecs([...specs, { specKey: "", specValue: "", groupName: "Cấu hình" }]);
  };
  const removeSpecField = (index) => {
  const newSpecs = specs.filter((_, i) => i !== index);
  setSpecs(newSpecs);
};

  return (
    <div className="container">
    <div className="center-container">
      <form className="row g-3 pt-5" onSubmit={submitHandler}>
        <div className="col-md-6">
          <label className="form-label">
            <h6>Name</h6>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Product Name"
            onChange={handleInputChange}
            value={product.name}
            name="name"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">
            <h6>Brand</h6>
          </label>
          <input
            type="text"
            name="brand"
            className="form-control"
            placeholder="Enter your Brand"
            value={product.brand}
            onChange={handleInputChange}
            id="brand"
          />
        </div>
        <div className="col-12">
          <label className="form-label">
            <h6>Description</h6>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Add product description"
            value={product.description}
            name="description"
            onChange={handleInputChange}
            id="description"
          />
        </div>
        <div className="col-5">
          <label className="form-label">
            <h6>Price</h6>
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="Eg: 1000000 VND"
            onChange={handleInputChange}
            value={product.price}
            name="price"
            id="price"
          />
        </div>
     
           <div className="col-md-6">
          <label className="form-label">
            <h6>Category</h6>
          </label>
          <input
            type="text"
            className="form-control"
            value={product.category}
            onChange={handleInputChange}
            name="category"
            id="category"
            list="categoryOptions"
            placeholder="Chọn hoặc nhập danh mục mới"
          />
          <datalist id="categoryOptions">
            {categories.map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="col-md-4">
          <label className="form-label">
            <h6>Stock Quantity</h6>
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="Stock Remaining"
            onChange={handleInputChange}
            value={product.quantity}
            name="quantity"
            // value={`${stockAlert}/${stockQuantity}`}
            id="quantity"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">
            <h6>Release Date</h6>
          </label>
          <input
            type="date"
            className="form-control"
            value={product.releaseDate}
            name="releaseDate"
            onChange={handleInputChange}
            id="releaseDate"
          />
        </div>
        {/* <input className='image-control' type="file" name='file' onChange={(e) => setProduct({...product, image: e.target.files[0]})} />
    <button className="btn btn-primary" >Add Photo</button>  */}
        <div className="col-md-4">
          <label className="form-label">
            <h6>Image</h6>
          </label>
          <input
            className="form-control"
            type="file"
            onChange={handleImageChange}
          />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="available"
              id="gridCheck"
              checked={product.available}
              onChange={(e) =>
                setProduct({ ...product, available: e.target.checked })
              }
            />
            <label className="form-check-label">Product Available</label>
          </div>
          </div>
          <h6>Thông số kỹ thuật (Specifications)</h6>
          {specs.map((spec, index) => (
            <div key={index} className="row g-2 mb-2">
              <div className="col-md-5">
                <input type="text" className="form-control" name="specKey" placeholder="Tên thông số (VD: CPU)" value={spec.specKey} onChange={(e) => handleSpecChange(index, e)} />
              </div>
              <div className="col-md-5">
                <input type="text" className="form-control" name="specValue" placeholder="Giá trị (VD: Apple M3)" value={spec.specValue} onChange={(e) => handleSpecChange(index, e)} />
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm mb-3" onClick={addSpecField}>+ Thêm thông số</button>
        <div className="col-12">
          <button
            type="submit"
            className="btn btn-primary"
            // onClick={submitHandler}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default AddProduct;
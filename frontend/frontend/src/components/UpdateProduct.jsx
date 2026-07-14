import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "../axios";
import { toast } from 'react-toastify'; // Thêm import toast
import AppContext from "../context/Context";

const UpdateProduct = () => {
  const { data } = useContext(AppContext);
  const categories = data && data.length > 0 
    ? [...new Set(data.map(p => p.category))].filter(Boolean) 
    : ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState();
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    available: false,
    quantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/product/${id}`
        );

        setProduct(response.data);
        setUpdateProduct(response.data);
        if (response.data.specifications && response.data.specifications.length > 0) {
        setSpecs(response.data.specifications);
      }else {
        setSpecs([{ specKey: "", specValue: "" }]); // Nếu chưa có thì cho 1 dòng trống để nhập
      }
      
        const responseImage = await axios.get(
          `http://localhost:8080/api/product/${id}/image`,
          { responseType: "blob" }
        );
        const imageFile = await convertUrlToFile(
          responseImage.data,
          response.data.imageName
        );
        setImage(imageFile);     
        setUpdateProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    console.log("image Updated", image);
  }, [image]);



  const convertUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }
 
  const handleSubmit = async(e) => {
    e.preventDefault();
    const filteredSpecs = specs.filter(s => s.specKey.trim() !== "");

    const updatedData = {
    ...updateProduct,
    specifications: filteredSpecs
  };
    const updatedProduct = new FormData();
    updatedProduct.append("imageFile", image);
    updatedProduct.append(
      "product",
      new Blob([JSON.stringify(updatedData)], { type: "application/json" })
    );
  

  console.log("formData : ", updatedProduct)
    axios
      .put(`http://localhost:8080/api/product/${id}`, updatedProduct, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Product updated successfully:", updatedProduct);
        toast.success("Product updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        console.log("product unsuccessfull update",updateProduct)
        toast.error("Failed to update product. Please try again.");
      });
  };
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct({
      ...updateProduct,
      [name]: value,
    });
  };
  
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
    const [specs, setSpecs] = useState([{ specKey: "", specValue: "", groupName: "Cấu hình" }]);
  
  const handleSpecChange = (index, e) => {
      const { name, value } = e.target;
      const newSpecs = [...specs];
      newSpecs[index] = { ...newSpecs[index], [name]: value };
      setSpecs(newSpecs);
    };
  
    const addSpecField = () => {
      setSpecs([...specs, { specKey: "", specValue: "", groupName: "Cấu hình" }]);
  };
  const removeSpecField = (index) => {
    // 1. Tạo mảng mới đã lọc bỏ phần tử tại index
    const newSpecs = specs.filter((_, i) => i !== index);
    
    // 2. Cập nhật state specs để UI biến mất dòng đó ngay lập tức
    setSpecs(newSpecs);

    // 3. (QUAN TRỌNG) Cập nhật lại object updateProduct để khi nhấn Submit dữ liệu đã sạch
    setUpdateProduct(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };
  

  return (
    <div className="update-product-container">
      <div className="center-container">
        <form className="row g-3 pt-5" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label className="form-label">
              <h6>Name</h6>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder={product.name}
              value={updateProduct.name}
              onChange={handleChange}
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
              placeholder={product.brand}
              value={updateProduct.brand}
              onChange={handleChange}
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
              placeholder={product.description}
              name="description"
              onChange={handleChange}
              value={updateProduct.description}
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
              onChange={handleChange}
              value={updateProduct.price}
              placeholder={product.price}
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
              value={updateProduct.category}
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder={product.quantity}
              value={updateProduct.quantity}
              name="quantity"
              id="quantity"
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">
              <h6>Image</h6>
            </label>
            <img
              src={image ? URL.createObjectURL(image) : "Image unavailable"}
              alt={product.imageName}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                padding: "5px",
                margin: "0",
              }}
            />
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
              placeholder="Upload image"
              name="imageUrl"
              id="imageUrl"
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                id="gridCheck"
                checked={updateProduct.available}
                onChange={(e) =>
                  setUpdateProduct({ ...updateProduct, available: e.target.checked })
                }
              />
              <label className="form-check-label">Product Available</label>
            </div>
          </div>
          <h6>Thông số kỹ thuật (Specifications)</h6>
          {specs.map((spec, index) => (
            <div key={index} className="row g-2 mb-2 align-items-center">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  name="specKey"
                  placeholder="Tên thông số (VD: CPU)"
                  value={spec.specKey || ""}
                  onChange={(e) => handleSpecChange(index, e)}
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  name="specValue"
                  placeholder="Giá trị (VD: Apple M3)"
                  value={spec.specValue || ""}
                  onChange={(e) => handleSpecChange(index, e)}
                />
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => removeSpecField(index)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          <div className="col-12">
            <button
              type="button"
              className="btn btn-secondary btn-sm mb-3"
              onClick={addSpecField}
            >
              + Thêm thông số
            </button>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
import Link from "next/link";
import "../styles/productcard.scss";

const ProductCard = (props) => {
  const id = props.image?.match(/\d+/)?.[0] || 1;
  return (
    <div className="card-prod">
      <Link href={`/product/${id}`} className="card-prod-img">
        <img src={props.image} alt="Needle Design" />
      </Link>
      <div className="card-prod-btn">
        <Link href={`/product/${id}`}>
          <button style={{ width: "100%", color: "#F4E6CD" }}>Description</button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;

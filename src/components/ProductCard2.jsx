import Link from "next/link";
import "../styles/productcard2.scss";

const ProductCard2 = (props) => {
  const id = props.image?.match(/\d+/)?.[0] || 1;
  return (
    <div className="card-prod2">
      <Link href={`/product/${id}`} className="card-prod-img2">
        <img src={props.image} alt="Needle Design" />
      </Link>
    </div>
  );
};

export default ProductCard2;

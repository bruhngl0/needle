import "../styles/page3.scss";
import ProductCard from "./ProductCard";
import ProductCard2 from "./ProductCard2";

const Page3 = () => {
  return (
    <div className="page3-main">
      <div className="page3-art">
        <div className="pattern-two">
          <img src="/patternleft.png" alt="Pattern Left" />
          <p className="page2-des">CATEGORIES</p>
          <img src="/patternright.png" alt="Pattern Right" />
        </div>
      </div>
      <div className="page3-collection"></div>

      <div className="page3-products">
        <ProductCard2 image="/model5.png" />
        <ProductCard2 image="/model4.png" />
      </div>
    </div>
  );
};

export default Page3;

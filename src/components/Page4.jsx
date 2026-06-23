import ProductCard from "./ProductCard";
import "../styles/page2.scss";

const Page4 = () => {
  return (
    <div className="page2-main">
      <div className="page2-art">
        <div className="pattern-one">
          <img src="/patternmiddle.png" alt="Pattern Middle" />
        </div>
        <div className="pattern-two">
          <img src="/patternleft.png" alt="Pattern Left" />
          <p className="page2-des">NEW ARRIVALS</p>
          <img src="/patternright.png" alt="Pattern Right" />
        </div>
      </div>
      <div className="page2-collection"></div>

      <div className="page2-products">
        <ProductCard image="/model6.png" />
        <ProductCard image="/model7.png" />
        <ProductCard image="/model8.png" />
      </div>
    </div>
  );
};

export default Page4;

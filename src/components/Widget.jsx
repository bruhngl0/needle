const Widget = (props) => {
  return (
    <div className="widget">
      <img
        src={props.img}
        style={{
          width: `${props.width}`,
          height: `${props.height}`,
          marginRight: "30px",
        }}
      />
    </div>
  );
};

export default Widget;

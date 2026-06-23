const Logo = (props) => {
  return (
    <div className="logo">
      <img
        src="logopink.png"
        style={{ width: `${props.width}`, height: `${props.height}` }}
      />
    </div>
  );
};

export default Logo;

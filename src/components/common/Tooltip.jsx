const Tooltip = ({ children, text }) => (
  <div className="relative tooltip-trigger inline-block">
    {children}
    <div className="tooltip-content">{text}</div>
  </div>
);

export default Tooltip;
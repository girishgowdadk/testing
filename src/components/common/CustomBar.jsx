import { motion } from 'motion/react';

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  return (
    <motion.rect 
      initial={{ height: 0, y: y + height }}
      animate={{ height, y }}
      transition={{ duration: 0.8, ease: "circOut" }}
      x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} 
    />
  );
};

export default CustomBar;
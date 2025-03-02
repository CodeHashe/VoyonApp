import React from "react";
import { View } from "react-native";
import Svg, { Ellipse as SvgEllipse } from "react-native-svg";

const Ellipse = ({ radiusX, radiusY, color, x, y }) => {
  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      <Svg height={radiusY * 2} width={radiusX * 2}>
        <SvgEllipse
          cx={radiusX} 
          cy={radiusY} 
          rx={radiusX}
          ry={radiusY} 
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default Ellipse;

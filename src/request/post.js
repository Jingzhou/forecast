import api from "./api";
import { $http } from "./index";

// 获取小六壬结果解释
const gerForecast = (data) => {
  return $http.post(api.gerForecast, data);
}
// 解卦
const gerDivination = (data) => {
  return $http.post(api.gerDivination, data);
}

export default {
  gerForecast,
  gerDivination,
};

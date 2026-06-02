import { useEffect,useState } from "react";
import { getQueueMetrics } from "../api/metrics";

export const useQueueMetrics=()=> {
const [metrics,setMetrics]=useState<any>(null);

const loadMetrics=async()=> {
try {
const data=await getQueueMetrics();

console.log("METRICS:",data);

setMetrics(data);
} catch(error) {
console.log("METRICS ERROR:",error);
}
};

useEffect(()=> {
loadMetrics();

const interval=setInterval(()=> {
loadMetrics();
},5000);

return ()=>clearInterval(interval);
},[]);

return metrics;
};
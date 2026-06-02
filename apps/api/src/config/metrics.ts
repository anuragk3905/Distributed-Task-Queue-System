import { Counter,Gauge,Histogram,Registry,collectDefaultMetrics } from "prom-client";

export const register=new Registry();

collectDefaultMetrics({
register,
});

export const jobsProcessed=new Counter({
name:"jobs_processed_total",
help:"Total processed jobs",
labelNames:["status"],
registers:[register],
});

export const queueDepth=new Gauge({
name:"queue_depth",
help:"Current queue depth",
labelNames:["queue"],
registers:[register],
});

export const jobDuration=new Histogram({
name:"job_duration_seconds",
help:"Job duration",
buckets:[0.1,0.5,1,2,5,10,30,60],
registers:[register],
});
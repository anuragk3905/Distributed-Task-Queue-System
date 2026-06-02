import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

export const emailQueue=
new Queue("email-tasks",{
connection,

defaultJobOptions:{
removeOnComplete:{
count:100,
},
removeOnFail:{
count:500,
},
attempts:5,
backoff:{
type:"exponential",
delay:1000,
},
},
});
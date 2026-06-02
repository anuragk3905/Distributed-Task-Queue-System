import { FlowProducer } from "bullmq";
import { connection } from "./redis.js";

export const flowProducer=new FlowProducer({
connection,
});
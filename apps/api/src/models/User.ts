import mongoose from "mongoose";
import bcrypt from "bcrypt";

export type Role = "Admin" | "Operator" | "Viewer";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidate: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["Admin", "Operator", "Viewer"],
      default: "Viewer",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return await bcrypt.compare(candidate, this.password as string);
};

export const User = mongoose.model<IUser>("User", userSchema);

import mongoose, { Document, Schema } from 'mongoose';
interface IUser extends Document {
  username: string;
  password: string;
}
interface ITodo extends Document {
  title: string;
  description: string;
  done: boolean;
  userId: string;
}
const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
// The "Schema<IUser>" ensures that the schema follows the interface.
const todoSchema = new Schema<ITodo>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  done: { type: Boolean, required: true },
  userId: { type: String, required: true },
});
// The mongoose.model<IUser> makes sure the model returns documents of type IUser.
export const User = mongoose.model<IUser>('User', userSchema);
export const Todo = mongoose.model<ITodo>('Todo', todoSchema);
// ! 🔴 1️⃣ My Thought Process  
// Initially, I believed that since Mongoose Schema enforces `required: true`, there was no way a field could be missing.  
// However, I realized that while Mongoose ensures valid data **when saving**, it doesn’t guarantee that the data will always be present **when retrieving**.  
// For example, if a user’s password was deleted from the database but their username still exists, then a query like `User.findOne({ username: 'john_doe' })`  
// would return a user document **without a password field**, leading to a potential runtime error when accessing `user.password`.  
// ? 🔵 That’s where TypeScript comes in—it ensures that the `User` model follows the `IUser` structure, helping to prevent such unexpected issues in code.  

// ---  

// ! 🔴 2️⃣ Mongoose Schema vs. TypeScript Type Safety  
// ✅ 🟢 **Mongoose Schema (`required: true`)**  
// - Ensures valid data is **stored in MongoDB**.  
// - Prevents saving incomplete documents (e.g., missing `username` or `password`).  
// - Example:  
//   ```ts
//   const user = new User({ password: 'securepass' });
//   await user.save(); // ❌ Will throw a validation error because username is missing.
//   ```

// ✅ 🟢 **TypeScript Type Safety (`<IUser>`)**  
// - Ensures correct **type usage in the code**.  
// - Prevents accessing properties that might be missing.  
// - Example:  
//   ```ts
//   const User = mongoose.model<IUser>('User', userSchema);
//   ```
//   This tells TypeScript that every `User` document **must** match the `IUser` interface.  

// ---  

// ! 🔴 3️⃣ Why Queries Can Return `null`  
// Even if a field is required in the schema, **queries (`findOne`, `findById`) might return `null`**:  
// ```ts
// const user = await User.findOne({ username: 'does_not_exist' });
// console.log(user); // ➡️ null, because no user with this username exists.
// ```  
// ? 🔵 If you try:  
// ```ts
// console.log(user.password.toUpperCase()); // ❌ Runtime error! Cannot read 'toUpperCase' of null.
// ```  
// Since `user` is `null`, trying to access `user.password` will result in an error.  

// ---  

// ! 🔴 4️⃣ Handling Possible `null` Values  

// ✅ 🟢 **1. Use a Null Check**  
// ```ts
// if (user) {
//   console.log(user.password.toUpperCase()); // ✅ Safe
// } else {
//   console.log('User not found');
// }
// ```  

// ✅ 🟢 **2. Use Optional Chaining (`?.`)**  
// ```ts
// console.log(user?.password?.toUpperCase()); // ✅ Safe, won’t crash if user is null.
// ```  
// - If `user` is `null`, it **skips** accessing `password` instead of throwing an error.  

// ❗ 🟠 **3. Use Non-Null Assertion (`!`)** (⚠️ Risky)  
// ```ts
// console.log(user!.password.toUpperCase()); // ❌ Will crash if user is null!
// ```  
// - The `!` tells TypeScript **"Trust me, user will never be null"**, but if it is, your app **will crash**.  

// ---  

// ! 🔴 5️⃣ Key Takeaways  
// ✅ 🟢 **Mongoose Schema (`required: true`)** ensures **valid data storage**, but not retrieval.  
// ✅ 🟢 **TypeScript (`<IUser>`)** ensures type safety inside the code.  
// ✅ 🟢 **Queries can return `null`**, so always check for it.  
// ✅ 🟢 **Use optional chaining (`?.`)** to prevent runtime errors.  
// ❗ 🟠 **Use `!` cautiously**, only when you are 100% sure the data exists.  

// ------------------------------------------------------------------------------------------------------------------------


// // utils/redirects.js
// export const getRoleBasedRedirect = (user) => {
//   if (!user) return "/login";

//   console.log("🎯 Determining redirect for role:", user.role);

//   switch (user.role) {
//     case "admin":
//       return "/admin/dashboard";
//     case "teacher":
//       return "/teacher/dashboard";
//     case "student":
//       return "/my-courses";
//     default:
//       return "/";
//   }
// };

// // Use it in your login
// import { getRoleBasedRedirect } from "../utils/redirects";

// // After successful login
// const redirectPath =
//   location.state?.from?.pathname || getRoleBasedRedirect(user);
// console.log("📍 Redirecting to:", redirectPath);
// navigate(redirectPath, { replace: true });




// utils/redirects.js
export const getRoleBasedRedirect = (user) => {
  if (!user) return "/login";

  console.log("🎯 Determining redirect for role:", user.role);

  switch (user.role) {
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/my-courses";
    default:
      return "/";
  }
};

// Use it in your login
import { getRoleBasedRedirect } from "../utils/redirects";

// After successful login
const redirectPath =
  location.state?.from?.pathname || getRoleBasedRedirect(user);
console.log("📍 Redirecting to:", redirectPath);
navigate(redirectPath, { replace: true });

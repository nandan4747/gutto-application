export const isUserAlreadyVisted = () => {
  console.log("checking new user");
  const isAlreadyVisited = localStorage.getItem("new_user") || false;
  console.log(`isAlreadyVisited ${isAlreadyVisited}`);
  return isAlreadyVisited;
};
export const markUserAsVisted = () => {
  localStorage.setItem("new_user", "true");
};

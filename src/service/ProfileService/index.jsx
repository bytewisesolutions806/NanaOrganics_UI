let profile = {
  id: "customer_demo",
  first_name: "Stephen",
  last_name: "Parker",
  email: "stephen@example.com",
  phone: "+91 9876543210",
};

export const fetchProfileApi = async () => ({
  success: true,
  data: { customer: { ...profile } },
});

export const updateProfileApi = async (body) => {
  profile = { ...profile, ...body };
  return { success: true, data: { customer: { ...profile } } };
};

export const changePasswordApi = async () => ({
  success: true,
  message: "Password updated for this demo session.",
});

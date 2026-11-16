const CONFIG = {
  BASE_URL: "https://reviveapi.tactionclients.com/",
  HEADER: {
    Authorization:localStorage.getItem('access_token')
    ? { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    : {},
  },
};

export default CONFIG;

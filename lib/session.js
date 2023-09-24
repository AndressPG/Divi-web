// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
export const sessionOptions = {
  password: 'oN1q2JYaHyRXnwo08h9rMmoUvsKjw96UyDPn',
  cookieName: "manati/divi/front/next.js",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

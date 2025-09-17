const useFetch = () => {
  try {
    const fetchData = async (
      endpoint,
      method = "GET",
      body = null,
      token = null,
      instanceOfFormData = false
    ) => {
      const uri = import.meta.env.VITE_SERVER + endpoint;

      const options = {
        method,
        headers: {},
      };

      if (!instanceOfFormData) {
        options.headers["Content-Type"] = "application/json";
      }
      // else {
      //   options.headers["Content-Type"] = "multipart/form-data";
      // }

      if (token) {
        options.headers["authorization"] = "Bearer " + token;
      }

      if (body && method !== "GET" && !instanceOfFormData) {
        options.body = JSON.stringify(body);
      } else if (body && method !== "GET" && instanceOfFormData) {
        options.body = body;
      }

      // console.log(options);

      const res = await fetch(uri, options);

      const data = await res.json();

      if (!res.ok) {
        if (data.msg) {
          throw data.msg;
        } else {
          throw "an unknown error has occurred, please try again later";
        }
      }

      return data;
    };

    return fetchData;
  } catch (err) {
    return { ok: false, msg: "data error" };
  }
};

export default useFetch;

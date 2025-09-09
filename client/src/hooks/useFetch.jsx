const useFetch = () => {
  try {
    const fetchData = async (endpoint, method, body, token) => {
      const uri = import.meta.env.VITE_SERVER + endpoint;

      const res = await fetch(uri, {
        method,
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.errors) {
          const errorMsgArray = data.msg.map((error) => error.msg);
          const errorMsgs = errorMsgArray.join(", ");
          throw data.errors[0].msg;
        } else if (data.status === "error") {
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

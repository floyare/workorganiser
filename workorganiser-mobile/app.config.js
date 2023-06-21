import moment from "moment";

export default ({
  config
}) => {
  config.extra = {
    'buildDate': moment().format("DD.MM.YYYY HH:mm"),
    "eas": {
      "projectId": "104fcaa2-d9e2-4e5c-a9fc-aaced4953dff"
    }
  };
  return config;
};
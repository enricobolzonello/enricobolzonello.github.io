import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  includes: "_includes/",
  
});
site.use(plugins());

export default site;

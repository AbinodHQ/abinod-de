import * as deepl from "deepl-node";

const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  throw new Error("Missing DEEPL_API_KEY");
}

const translator = new deepl.DeepLClient(authKey);

const html = `
  <section class="page-hero">
    <h1>Building products with strong foundations.</h1>
    <p>
      Abinod develops software products and
      professional digital print solutions.
    </p>
  </section>
`;

const result = await translator.translateText(
  html,
  "en",
  "de",
  {
    tagHandling: "html",
  }
);

console.log(result.text);

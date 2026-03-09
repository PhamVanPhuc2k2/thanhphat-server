import slugify from "slugify";

export const handleSlugify = (text: string) => {
  return slugify(text, {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: false,
    locale: "vi",
    trim: true,
  });
};

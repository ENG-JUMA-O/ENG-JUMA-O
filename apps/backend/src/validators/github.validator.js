import { param, query, validationResult } from "express-validator";

export const profileValidator = [
  query().custom((_, { req }) => {
    if (Object.keys(req.query).length > 0) {
      throw new Error("Query parameters are not supported.");
    }

    return true;
  }),
];

export const projectsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("page must be an integer between 1 and 10000")
    .toInt(),

  query("per_page")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("per_page must be an integer between 1 and 100")
    .toInt(),

  query("sort")
    .optional()
    .isIn(["created", "updated", "pushed", "full_name"])
    .withMessage("Invalid repository sort option"),

  query("direction")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("direction must be asc or desc"),
];

const repositoryNameValidator = () =>
  param("repositoryName")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Repository name must be 1–100 characters")
    .bail()
    .matches(/^[A-Za-z0-9._-]+$/)
    .withMessage("Repository name contains invalid characters")
    .bail()
    .custom((value) => {
      if (value === "." || value === "..") {
        throw new Error("Invalid repository name");
      }

      return true;
    });

export const projectValidator = [repositoryNameValidator()];

export const projectReadmeValidator = [repositoryNameValidator()];

export const projectReadmeHtmlValidator = [repositoryNameValidator()];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Request validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        location: error.location,
      })),
    });
  }

  next();
};

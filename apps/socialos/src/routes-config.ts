export enum RouteType {
  PUBLIC = "public",
  AUTH = "auth",
  PROTECTED = "protected",
}

export const ROUTE_PATTERNS = {
  public: ["/", "/about", "/contact", "/pricing", "/public"],

  protected: ["dashboard"],
};

export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const core = __importStar(require("@actions/core"));
const getConfig = () => ({
    GITHUB_TOKEN: core.getInput("GITHUB_TOKEN"),
    OPENAI_API_KEY: core.getInput("OPENAI_API_KEY"),
    OPENAI_API_MODEL: core.getInput("OPENAI_API_MODEL"),
    EXCLUDE_PATTERNS: core.getInput("EXCLUDE_PATTERNS") || "**/*.test.js,**/*.spec.js,**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*_test.py,tests/**,**/*.pyc,venv/**,env/**,build/**,dist/**,.coverage,htmlcov/**,**/*.class,target/**,.gradle/**,.m2/**,src/test/java/**,**/*.o,**/*.obj,obj/**,**/*.rbc,cache/**,.bundle/**,vendor/**,phpunit.xml,var/cache/**,*.log,temp/**,.vscode/**,.idea/**"
});
exports.getConfig = getConfig;

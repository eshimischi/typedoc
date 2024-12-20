export {
    filterMap,
    insertPrioritySorted,
    partition,
    removeIf,
    removeIfPresent,
    unique,
} from "./array.js";
export { AbstractComponent } from "./component.js";
export * from "./enum.js";
export { EventDispatcher } from "./events.js";
export {
    isFile,
    copy,
    copySync,
    getCommonDirectory,
    readFile,
    writeFile,
    writeFileSync,
    discoverInParentDir,
    discoverPackageJson,
} from "./fs.js";
export { normalizePath } from "./paths.js";
export type { IfInternal, NeverIfInternal, Chars } from "./general.js";
export { assertNever, TYPEDOC_ROOT } from "./general.js";
export { ConsoleLogger, Logger, LogLevel } from "./loggers.js";
export { DefaultMap } from "./map.js";
export {
    ArgumentsReader,
    Option,
    CommentStyle,
    Options,
    PackageJsonReader,
    ParameterHint,
    ParameterType,
    TSConfigReader,
    TypeDocReader,
    OptionDefaults,
} from "./options/index.js";
export type {
    ArrayDeclarationOption,
    BooleanDeclarationOption,
    DeclarationOption,
    DeclarationOptionBase,
    DeclarationOptionToOptionType,
    KeyToDeclaration,
    MapDeclarationOption,
    MixedDeclarationOption,
    NumberDeclarationOption,
    FlagsDeclarationOption,
    ObjectDeclarationOption,
    OptionsReader,
    StringDeclarationOption,
    TypeDocOptionMap,
    TypeDocOptions,
    ValidationOptions,
    TypeDocOptionValues,
    ParameterTypeToOptionTypeMap,
    ManuallyValidatedOption,
    JsDocCompatibility,
    OutputSpecification,
} from "./options/index.js";
export { loadPlugins } from "./plugins.js";
export { getSortFunction } from "./sort.js";
export type { SortStrategy } from "./sort.js";

export { EventHooks } from "./hooks.js";

export * from "./entry-point.js";

import * as JSX from "./jsx.js";
export { JSX };
export { Fragment, Raw, renderElement } from "./jsx.js";

export * as Validation from "./validation.js";

export * from "./tsutils.js";

export { MinimalSourceFile } from "./minimalSourceFile.js";

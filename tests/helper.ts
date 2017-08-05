/*
 Screeps Typescript Test Helper
 We add the following to the global namespace to mimic the Screeps runtime:
 + lodash
 + Screeps game constants
 */
declare const global: any;
declare const _: any;

import * as lodash from "lodash";
import * as consts from "./../lib/screeps/common/lib/constants.js";

global._ = lodash;

_.merge(global, consts);

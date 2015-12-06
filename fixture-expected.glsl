precision mediump float;

#pragma glslify: z = require('./test')
#pragma glslify: y = require('./test', map1 = source2, map2 = source1)
#pragma glslify: x = require('./test', map1 = source1, map2 = source2)

void main() {

}

#pragma glslify: export(w)

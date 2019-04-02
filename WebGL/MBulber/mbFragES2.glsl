#ifdef GL_ES
precision highp float;
#endif

uniform vec3 resolution;
uniform float lightR, lightG, lightB;
uniform float qjR, qjG, qjB;
uniform bool isFullRender;
uniform bool useShadow;
uniform bool useAO;
uniform float diffIntensity;
uniform float ambientLight;
uniform float shadowDarkness;

uniform mat3 Orientation;
uniform float phongMethod;
uniform float specularExponent;
uniform float specularComponent;
uniform float normalComponent;
uniform float maxDetailIter;

uniform float aoMult, aoSub, aoMix;

const vec3 Eye = vec3(0, 0, 2.2);
uniform vec3 Light;
uniform float epsilon;
const float Slice=.0;
uniform float maxIterations;// = 7;

uniform float Power;// = 12.0;
const float BAILOUT=2.0;

float EPS = epsilon;
float DEL = epsilon;


vec3 Phong(vec3 light, vec3 eye, vec3 pt, vec3 N) {
    vec3 diffuse = vec3(lightR, lightG, lightB);
    vec3 L = normalize(light - pt);
    vec3 E = normalize(eye - pt);
    float NdotL = dot(N, L);
    vec3 R = L - 2. * NdotL * N;
    diffuse += abs(N) * normalComponent;
    vec3 amb = vec3(ambientLight)*.66 + ambientLight*diffuse*.33;
    return max(vec3(0), amb + diffuse *  max(NdotL, 0.0) * diffIntensity + specularComponent * pow(max(dot(E, R), 0.0), specularExponent));
}
vec3 blinnPhong(vec3 light, vec3 eye, vec3 pt, vec3 N) {
    vec3 diffuse = vec3(lightR, lightG, lightB);
    vec3 L = normalize(light - pt);
    vec3 E = normalize(eye - pt);
    vec3 halfLV = normalize(L + E);
    float NdotL = dot(N, L);
    float spe = max( dot(N, halfLV), 0.0 );
    diffuse += abs(N) * normalComponent;
    vec3 amb = vec3(ambientLight)*.66 + ambientLight*diffuse*.33;
    return max(vec3(0), amb + diffuse *  max(NdotL, 0.0) * diffIntensity + specularComponent * pow(spe, specularExponent));
}


vec4 mainBulb(vec4 v)
{

    float r = length(v.xyz);
    if(r>BAILOUT) return v;
    float theta = acos(clamp(v.z/r, -1.0, 1.0))*Power;
    float phi = atan(v.y, v.x)*Power;
    v.w = pow(r,Power-1.0)*Power*v.w+1.0;

    float zr = pow(r,Power);
    return vec4(vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta))*zr, v.w);
}


vec3 NormEstimate(vec3 p, float slice) {
        
    vec4 g0 = vec4(p                  , .0);
    vec4 gx = vec4(p + vec3(DEL, 0, 0), .0);
    vec4 gy = vec4(p + vec3(0, DEL, 0), .0);
    vec4 gz = vec4(p + vec3(0, 0, DEL), .0);

    vec4 v0 = g0;
    vec4 vx = gx;
    vec4 vy = gy;
    vec4 vz = gz;
    
    float ln;
    for (int i = 0; i < 100; i++) {
        g0 = mainBulb(g0) + v0;
        gx = mainBulb(gx) + vx;
        gy = mainBulb(gy) + vy;
        gz = mainBulb(gz) + vz;
        ln = length(g0.xyz);
        if(ln>BAILOUT) break;        
        if(i>int(maxIterations)) break; // WebGL1 need of const Loop comp: real test is here
    }
    
    //float ln    = length(g0.xyz);
    float gradX = length(gx.xyz) - ln;
    float gradY = length(gy.xyz) - ln;
    float gradZ = length(gz.xyz) - ln;
    //N = normalize(vec3(length(gx-g0), length(gy-g0), length(gz-g0)));
    return normalize(vec3(gradX, gradY, gradZ));
}



float intersectMBulb(inout vec3 rO, inout vec3 rD, out vec4 trap)
{

    float dist;
    for(int i = 0; i<2000; i++) {
        float r=0.0;        
        vec4 v = vec4(rO, 1.0);
        trap = vec4(abs(v.xyz),dot(v.xyz,v.xyz));
        for(int n=0; n<100; ++n)
        {
            r = length(v.xyz);
            if(r>BAILOUT) break;

            v = mainBulb(v) + vec4(rO, 0.0);
            trap = min( trap, vec4(abs(v.xyz),dot(v.xyz,v.xyz)) );
            if(n>int(maxIterations)) break; // WebGL1 need of const Loop comp: real test is here
        }

        dist = 0.5*log(r)*r/v.w;
        rO += rD * dist;
        if(dist < EPS ) break;
        if(i>=int(maxDetailIter)) break;
    }
    return dist;
}

#define SHADOW

vec3 sampleCoord[9];


void main() {
//	vec4 Quat = vec4(Qx, Qy, Qz, Qw);
    const float NR = 1.;
	mat3 orient = Orientation;
	 sampleCoord[0] = vec3( 0.,  0., 1.);
	 sampleCoord[1] = vec3( NR, -NR, .3);
	 sampleCoord[2] = vec3(-NR,  NR, .3);
	 sampleCoord[3] = vec3( NR,  NR, .3);
	 sampleCoord[4] = vec3(-NR, -NR, .3);
	 sampleCoord[5] = vec3(  0,  NR, .5);
	 sampleCoord[6] = vec3(  0, -NR, .5);
	 sampleCoord[7] = vec3( NR,   0, .5);
	 sampleCoord[8] = vec3(-NR,   0, .5);

	//float colorDiv = 1., shadowDiv = 1.0, colorShadow = 1.;
    float colorDiv = .25, shadowDiv = 9.0, colorShadow = 0.;
    vec3 color = vec3(0.);
    for (int i = 0; i < 9; i++) {
		//vec2 coord = isFullRender ? gl_FragCoord.xy*2. + sampleCoord[i] : gl_FragCoord.xy*2.;

        vec2 coord = (gl_FragCoord.xy*2. + sampleCoord[i].xy) / resolution.xy - vec2(1.);

        vec3 ray = vec3(coord.x * resolution.z, coord.y, -1.);
        vec3 dir = orient * ray;
        vec3 origin = orient * Eye;

        vec4 col; //col.w AmbientOcclusion
        float dist = intersectMBulb(origin, dir, col);

        //float dist = IntersectQJulia(origin, dir, Quat, Slice);
        if (dist < EPS) {
            vec3 N = NormEstimate(origin, Slice);
            //float aoComponent = useAO ? (.45+.55*clamp( 1.7*col.w-.7 , .0, 1.0 )) : 1.0;
             float aoComponent = useAO ? (1.0-aoMix)+aoMix*clamp( aoMult*col.w-aoSub , .0, 1.0 ) : 1.0;
            color += Phong(orient * (Light*phongMethod),  orient * Eye, orient * ray, N*phongMethod) * aoComponent * sampleCoord[i].z;
            //color = vec3(1.) * (.45+.55*clamp( 1.7*col.w-.7 , .0, 1.0 ));
			//color = N; //vec3(1.0, 0., 0.);

            if(useShadow) {
                vec3 L = normalize( orient*Light - origin );
                origin += N*.005;
                dist = intersectMBulb(origin, L, col);

                 // Again, if our estimate of the distance to the set is small, we say
                 // that there was a hit.  In this case it means that the point is in
                 // shadow and should be given darker shading.
                 if( dist < EPS ) colorShadow += shadowDarkness;  // (darkening the shaded value is not really correct, but looks good)
                 else             colorShadow += 1.0;
            }

        }
		//colorMul = 1.0;
    	if(!isFullRender) { colorDiv = 1.; shadowDiv = 1.; break; }

    }
	//color = Orientation[1];
    gl_FragColor = vec4(color*colorDiv, 1.);
    
    if(useShadow) gl_FragColor.xyz *= colorShadow/shadowDiv;

    //gl_FragColor = vec4(color, 1.);
}

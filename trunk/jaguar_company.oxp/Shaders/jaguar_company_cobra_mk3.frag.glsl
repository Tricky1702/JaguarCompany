/* jaguar_company_cobra_mk3.frag.glsl for the Jaguar Company.
 *
 * Copyright © 2012-2013 Tricky
 *
 * This work is licensed under the Creative Commons
 * Attribution-Noncommercial-Share Alike 3.0 Unported License.
 *
 * To view a copy of this license, visit
 * http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
 * to Creative Commons, 171 Second Street, Suite 300, San Francisco,
 * California, 94105, USA.
 *
 * Cobra MK3 fragment shader for the Jaguar Company.
 * Based on Griff's multi-decal fragment shader.
 */

uniform sampler2D   uColorMap;
uniform sampler2D   uNormalMap;
uniform sampler2D   uEffectsMap;
uniform sampler2D   uDecalMap;

varying vec2        vTexCoord;
varying vec3        vEyeVector;     // These are all in tangent space
varying vec3        vLight0Vector;
varying vec3        vLight1Vector;

/* Constants */
const float         KspecExponent = 5.0;
const vec3          kLampColorNoAlert = vec3(0);
const vec3          kLampColorYellowAlert = vec3(0.9926, 0.9686, 0.7325);
const vec3          kLampColorRedAlert = vec3(1.0, 0.1, 0.0);

/* Uniforms from Oolite */
uniform bool        uHostileTarget;
uniform bool        uStationAegis;
uniform int         uScannedShips;
uniform float       uTime;
uniform bool        uNearlyDead;
uniform float       uHullHeatLevel;
uniform float       uEnginePower;
uniform vec4        uPaintColor1;   // used with paintmask map to tint diffuse texture
uniform vec4        uPaintColor2;   // used with paintmask map to tint diffuse texture
/* This is separated because Oolite 1.76.1 and previous do not pass the 4th parameter
 * in a vec4 vector. Future versions will do so.
 */
uniform vec4        uDecal_XY_Scale;
uniform float       uDecalRotation;

/* Irregular flickering function */
#ifdef OO_REDUCED_COMPLEXITY
#define Pulse(v, ts) ((v) * 0.95)
#define Blink_on_off(value) (1.0)
#else
float Pulse(float value, float timeScale)
{
    float t = uTime * timeScale;

    float s0 = t;
    s0 -= floor(s0);
    float sum = abs( s0 - 0.5);

    float s1 = t * 0.7 - 0.05;
    s1 -= floor(s1);
    sum += abs(s1 - 0.5) - 0.25;

    float s2 = t * 1.3 - 0.3;
    s2 -= floor(s2);
    sum += abs(s2 - 0.5) - 0.25;

    float s3 = t * 5.09 - 0.6;
    s3 -= floor(s3);
    sum += abs(s3 - 0.5) - 0.25;

    return (sum * 0.1 + 0.9) * value;
}

/* Hull Temperate heat glow effect */
vec3 TemperatureGlow(float level)
{
    vec3 result = vec3(0);

    result.r = level;
    result.g = level * level * level;
    result.b = max(level - 0.7, 0.0) * 2.0;

    return result;
}

/* Blink_on_off_function */
float Blink_on_off(float timeScale)
{
    float result = step(0.5, sin(uTime * timeScale));

    return result;
}

/* Cyan color exhaust glow effect */
vec3 cyanGlow(float level)
{
    vec3 result;
    result.rgb = vec3(0.2, 0.7, 0.9) * level * 1.5;

    return result;
}

/* Red/Orange color heated metal effect */
vec3 redGlow(float level)
{
    vec3 result;
    result.rgb = vec3(1.5, 0.55, 0.2) * level * 1.3;

    return result;
}
#endif

void Light(in vec3 lightVector, in vec3 normal, in vec3 lightColor, in vec3 eyeVector,
           in float KspecExponent, inout vec3 totalDiffuse, inout vec3 totalSpecular)
{
    lightVector = normalize(lightVector);
    vec3 reflection = normalize(-reflect(lightVector, normal));

    totalDiffuse += gl_FrontMaterial.diffuse.rgb * lightColor * max(dot(normal, lightVector), 0.0);
    totalSpecular += lightColor * pow(max(dot(reflection, eyeVector), 0.0), KspecExponent);
}

#define LIGHT(idx, vector) Light(vector, normal, gl_LightSource[idx].diffuse.rgb, eyeVector, KspecExponent, diffuse, specular)

#ifndef OO_REDUCED_COMPLEXITY
/* function to read in the colour map then scale and position the decal map onto it.
 *
 * "the_decaliser" - this function scales & positions the decal image using data passed
 * to it from the main shader
 */
vec4 the_decaliser()
{
    /* Setup the basic texture co-ords for the decals */
    vec2 decal_TexCoord = vTexCoord;

    /* Cache this value */
    float tmp = 1.0 / (2.0 * uDecal_XY_Scale.p); // 1/2n = 0.5/n

    /* Position the decal */
    decal_TexCoord -= vec2(uDecal_XY_Scale.s, uDecal_XY_Scale.t - tmp);

    /* Orientate & scale the decal */
    float decal_s = sin(uDecalRotation);
    float decal_c = cos(uDecalRotation);
    decal_TexCoord *= mat2(decal_c, decal_s, -decal_s, decal_c); // it's -decal_s when exported back to oolite

    decal_TexCoord += vec2(tmp);
    decal_TexCoord *= vec2(uDecal_XY_Scale.p, uDecal_XY_Scale.p);

    /* Get texture values */
    vec4 decal_Tex = texture2D(uDecalMap, decal_TexCoord);

    /* Modify the Decals texture co-oords */
    decal_TexCoord.s += 1.0;
    decal_Tex *= step(1.0, decal_TexCoord.s) *
                step(0.0, decal_TexCoord.t) *
                step(-2.0, -decal_TexCoord.s) *
                step(-1.0, -decal_TexCoord.t);

    /* Use the Alpha in the decal as a transparency mask so you can 'cutout' your decal from it's background */
    float alpha = decal_Tex.a;

    /* Return the scaled, position & rotated decal, it's mixed into the colour texture further on in the shader */
    return alpha * decal_Tex;
}
#endif

void main()
{
    vec3  eyeVector = normalize(vEyeVector);
    vec2  texCoord = vTexCoord;
    vec3  normal = normalize(texture2D(uNormalMap, vTexCoord).rgb - 0.5);
    vec3  colorMap = texture2D(uColorMap, texCoord).rgb;
    vec4  effectsMap = texture2D(uEffectsMap, texCoord);
    vec3  diffuse = vec3(0.0), specular = vec3(0);
    float specIntensity = texture2D(uColorMap, texCoord).a;
    float glowMap = texture2D(uNormalMap, texCoord).a;
    vec3  LampColor = vec3(0.9926, 0.9686, 0.7325);
    int   alertlevel = 0;

#ifdef OO_LIGHT_0_FIX
    LIGHT(0, vLight0Vector);
#endif
    LIGHT(1, vLight1Vector);
    diffuse += gl_FrontMaterial.ambient.rgb * gl_LightModel.ambient.rgb;

#ifndef OO_REDUCED_COMPLEXITY
    /* Full Shader Mode - Repaint the hull */
    colorMap += effectsMap.g * uPaintColor1.rgb;
    colorMap += effectsMap.a * uPaintColor2.rgb;

    /* Full Shader Mode - Apply the decal */
    vec4 decal = the_decaliser();

    /* We want to give the decals a matte finish, one way to  achieve this is to mix
     * them into the final texture fragment result after the lighting has been calculated, so we'll
     * store the texture + lighting in a vec3 called colour_temp
     */
    vec3 color_temp = colorMap; // temp vec3 to store the texturemap & lighting

    /* Calculate the lighting for full shader mode */
    color_temp += color_temp * specular * 6.0 * specIntensity;

    /* Mix in the decal over the top of the texture now that the specular lighting has been calculated.
     * The (0.3 * specular) adds a tiny bit of specular to the decal - remove for a fully matte finish
     */
    vec3 color = mix(color_temp, decal.rgb * diffuse + (0.3 * specular), decal.a) * diffuse;
#endif

    /* Calculate the lighting for simple shader mode */
#ifdef OO_REDUCED_COMPLEXITY
    vec3 color = diffuse * colorMap;
    color += colorMap * specular * 6.0 * specIntensity;
    /* Add in simple shader hull lights */
    color += LampColor * glowMap;
#endif

    /* these next glow effects are only available in full shader mode */
#ifndef OO_REDUCED_COMPLEXITY
    if (uNearlyDead || uHostileTarget)
        /* Low energy or we have a hostile target. */
        alertlevel = 3;
    else
    if (uScannedShips > 4 || uStationAegis)
        /* Other ships (other than Jaguar Company) near us or close to the main station. */
        alertlevel = 2;
    else
        /* Nothing around. */
        alertlevel = 1;

    /* check Alert Level, Adjust Lamp Colour Accordingly
     *
     * Current alert condition - 0 for docked, 1 for green, 2 for yellow, 3 for red.  
     */
    if (alertlevel > 1)
        LampColor = (alertlevel > 2) ? kLampColorRedAlert * max(mod(uTime, 1.0) * 2.0, 0.5) : kLampColorYellowAlert;
    else
        LampColor = kLampColorNoAlert;

    /* Add the hull lights glow effects, check if ship is throwingSparks, if so flicker the effects */
    if (uNearlyDead)
    {
        color += cyanGlow(effectsMap.b * Pulse(min(uEnginePower, 1.0), 1.0)) * Blink_on_off(Pulse(1.0, 0.7));
        color += LampColor * glowMap * 7.0 * colorMap.g * Blink_on_off(Pulse(1.0, 1.0));
    }
    else
    {
        color += cyanGlow(effectsMap.b * Pulse(min(uEnginePower, 1.0), 1.0));
        color += LampColor * glowMap * 7.0 * colorMap.g * Pulse(1.0, 0.3);
    }

    /* Add in the red heated metal glow around the exhaust */
    color += redGlow(effectsMap.r * Pulse(min(uEnginePower, 1.0), 1.0));

    /* Add the all over hull temperature glow. Full Shader mode only */
    float hullHeat = max(uHullHeatLevel - 0.5, 0.0) * 2.0;
    hullHeat = Pulse(hullHeat * hullHeat, 0.1);
    color += TemperatureGlow(hullHeat);
#endif

    gl_FragColor = vec4(color.rgb, 1.0);
}

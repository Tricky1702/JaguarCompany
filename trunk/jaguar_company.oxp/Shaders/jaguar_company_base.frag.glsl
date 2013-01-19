/* jaguar_company_base.fragment for the Jaguar Company Base.
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
 * Pixel/Fragment shader for the Jaguar Company Base.
 */

#define MAX_LIGHTS 8
#define NUM_LIGHTS 2

#ifdef IS_OOLITE
#define BASE_LIGHT 1
#else
#define BASE_LIGHT 0
#endif

varying vec2        vTexCoord;
varying vec3        vEyeVector; /* These are all in tangent space. */
varying vec3        vLightVectors[MAX_LIGHTS]; 

uniform sampler2D   uDiffuseTexture;
uniform sampler2D   uNormalTexture;
uniform float       uSpecExponent;

void Light(in vec3 lightVector, in vec3 normalMaterial, in vec3 lightColor, in vec3 eyeVector,
           in float specExponent, inout vec3 totalDiffuse, inout vec3 totalSpecular)
{
    lightVector = normalize(lightVector);
    vec3 reflection = normalize(-reflect(lightVector, normalMaterial));

    totalDiffuse += gl_FrontMaterial.diffuse.rgb * lightColor * max(dot(normalMaterial, lightVector), 0.0);
    totalSpecular += lightColor * pow(max(dot(reflection, eyeVector), 0.0), specExponent);
}

#define LIGHT(idx, vector) Light(vector, normalMaterial, gl_LightSource[idx].diffuse.rgb, eyeVector, uSpecExponent, diffuse, specular)

void main()
{
    vec3 eyeVector = normalize(vEyeVector);
    vec3 diffuse = vec3(0.0), specular = vec3(0.0);
    vec3 diffuseMaterial = texture2D(uDiffuseTexture, vTexCoord).rgb;
    vec3 normalMaterial = normalize(texture2D(uNormalTexture, vTexCoord).rgb - 0.5);

    /* Lights. */
#ifdef OO_LIGHT_0_FIX
    int i = 0;
#else
    int i = BASE_LIGHT;
#endif
    for (; i < NUM_LIGHTS; i++)
        LIGHT(i, vLightVectors[i]);

    /* Texture. */
    diffuse += gl_FrontMaterial.ambient.rgb * gl_LightModel.ambient.rgb;
    vec3 color = diffuseMaterial * diffuse;
    color += diffuseMaterial * specular;
    color *= 0.3;

    /* Return final result. */
    gl_FragColor = vec4(color.rgb, 1.0);
}

uniform sampler2D    uColorMap; // diffuse & refelction mask
uniform sampler2D    uNormalMap; // normal map & specular intensity map
uniform sampler2D    uEffectsMap; // paintmask illumination reflectionmask


varying vec2         vTexCoord;
varying vec3         vEyeVector;   // These are all in tangent space
varying vec3         vLight0Vector;
varying vec3         vLight1Vector;

// Constants
 const float KspecExponent = 6.0;
 const vec3  EnvironmentMapColor = vec3(0.5263, 0.3729, 0.3048);


// Uniforms from Oolite
   uniform float  uTime;
   uniform float  hull_heat_level;
   uniform float  engine_power; 
  

// Irregular flickering function
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

// Hull Temperate heat glow effect
     vec3 TemperatureGlow(float level) 
     { 
        vec3 result = vec3(0); 
    
        result.r = level; 
        result.g = level * level * level; 
        result.b = max(level - 0.7, 0.0) * 2.0;
        return result;    
     } 
   
// Cyan color exhaust glow effect
   vec3 cyanGlow(float level)
   {
      vec3 result;
      result.rgb = vec3(0.2, 1.0, 1.5) * level;
      return result;
   }
     
// Red/Orange color heated metal effect
   vec3 redGlow(float level)
   {
      vec3 result;
      result.rgb = vec3(1.0, 0.2, 0.0) * level * 2.0;
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
// function to read in the colour map then re-paint it - full shader mode only

vec3 diffuseColor() 
{ 
   vec3 eyeVector = normalize(vEyeVector);
   vec2 reflectioneffect = vTexCoord * eyeVector.xy * vec2(-1.0, 1.0);

// Get texture values. 
   vec3 baseTex = texture2D(uColorMap, vTexCoord).rgb; 
   float reflectionMap = texture2D(uEffectsMap, reflectioneffect).g;
   float mask = texture2D(uNormalMap, vTexCoord).a;
// Return final colourmap
 return baseTex + EnvironmentMapColor.rgb * reflectionMap * mask; 
}  

#endif

void main()
{
   vec3 eyeVector = normalize(vEyeVector);
   vec3 normal = normalize(texture2D(uNormalMap, vTexCoord).rgb - 0.5); 
   vec3 colorMap = texture2D(uColorMap, vTexCoord).rgb;
   vec4 effectsMap = texture2D(uEffectsMap, vTexCoord);
   vec3 diffuse = vec3(0.0), specular = vec3(0);
   float specIntensity = texture2D(uColorMap, vTexCoord).a * 7.0;
   vec3  LampColor = vec3(0.9, 0.05, 0.0);

#ifdef OO_LIGHT_0_FIX
   LIGHT(0, normalize(vLight0Vector));
#endif
   LIGHT(1, normalize(vLight1Vector)); // change the 0 to 1 when exporting back to oolite
      diffuse += gl_FrontMaterial.ambient.rgb * gl_LightModel.ambient.rgb;
      
// Calculate the lighting for full shader mode
#ifndef OO_REDUCED_COMPLEXITY 
  vec3 color = diffuse * diffuseColor();   
   // add the specular highlights    
       color += colorMap * specular * specIntensity;
        
#endif
// Calculate the lighting for simple shader mode
#ifdef OO_REDUCED_COMPLEXITY    
   vec3 color = diffuse * colorMap;
   color += colorMap * specular * specIntensity;
   // Add in simple shader lights
   color += LampColor * effectsMap.a; 
#endif

// these next glow effects are only available in full shader mode   
#ifndef OO_REDUCED_COMPLEXITY 

    
// Add the hull lights glow effects,
    color += LampColor * effectsMap.a * Pulse(1.0, 0.3); 
    color += cyanGlow(effectsMap.b * Pulse(min(engine_power, 1.0), 1.0));             

// Add in the red heated metal glow around the exhaust. 
  color += redGlow(effectsMap.r * Pulse(min(engine_power, 1.0), 1.0));
   
// Add the all over hull temperature glow. Full Shader mode only
   float hullHeat = max(hull_heat_level - 0.5, 0.0) * 2.0; 
   hullHeat = Pulse(hullHeat * hullHeat, 0.1); 
   color += TemperatureGlow(hullHeat); 
#endif   
    
   gl_FragColor = vec4(color.rgb, 1.0);
}

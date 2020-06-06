class Shaders {
    constructor(props) {

    }

    static circleVertexShader() {
        return [
            `precision highp float;
           
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float zoomLevel;
           uniform vec3 strokeColor;
           attribute vec3 position;
           attribute vec3 vertexPos;
           attribute vec3 color;
           attribute float alpha;
           attribute float radius;
           attribute vec2 uv;
           attribute float fixedPosition;
           attribute float textureIndexes;
           attribute float textureTypes;
           varying vec4 vColor;
           varying vec4 sColor;
           varying vec2 vUV;
           varying float fixedItem;
           varying float tIndex;
           varying float tType;
           
           void main() {                
                vec4 mvPosition = modelViewMatrix * vec4(vertexPos, 1.0);
                vUV = uv;
                fixedItem = fixedPosition;
                tIndex = textureIndexes;
                tType = textureTypes;
                     
                mvPosition.xyz += position * radius * zoomLevel;
                vColor = vec4(color, alpha);
                sColor = vec4(strokeColor, alpha);
   
                gl_Position = projectionMatrix * mvPosition;
           }`
        ].join("\n");
    };

    static circleFragmentShader() {
        return [
            `#extension GL_OES_standard_derivatives : enable
           
           precision highp float;
           varying vec4 vColor;
           varying vec4 sColor;
           varying vec2 vUV;
           varying float fixedItem;
           varying float tIndex;
           varying float tType;
           uniform sampler2D texture;
           uniform float textureAtlasSize;
                 
           vec4 fragmentColor () {
               float rowIndex = floor(tIndex / textureAtlasSize);
               float columnIndex = tIndex - textureAtlasSize * rowIndex;
               float uvStep = 1.0 / textureAtlasSize;               
               
               return texture2D(texture, vec2(vUV[0]*uvStep+uvStep*columnIndex, vUV[1]*uvStep+uvStep*(textureAtlasSize-1.0-rowIndex)));
           }
           
           void main() {                   
              vec4 fColor;
              float strokeWidth = 0.09;
              float outerEdgeCenter = 0.5 - strokeWidth;
              float d = distance(vUV, vec2(.5, .5));
              float delta = fwidth(d);
              float alpha = 1.0 - smoothstep(0.45 - delta, 0.45, d);
              float stroke = 1.0 - smoothstep(outerEdgeCenter - delta, outerEdgeCenter + delta, d);
                          
              if (tIndex == 99999.0) {                                   
                  if (fixedItem == 0.0) {                                          
                      gl_FragColor = vec4(vColor.rgb, alpha * vColor.a);                                          
                  } else {                                                                 
                      gl_FragColor = vec4( mix(sColor.rgb, vColor.rgb, stroke), alpha * vColor.a ); 
                                           
                      //vec2 st = gl_FragCoord.xy; 
                      // if(d < 0.46) gl_FragColor = vColor;
                      // else if(d > 0.46) gl_FragColor = sColor;
                      // else discard;
                  }              
              } else {
                  if (tType == 0.0) {
                    fColor = fragmentColor();
                  } else if (tType == 1.0) {
                    fColor = vec4(vColor.rgb, fColor.a);   
                  }
                                                                              
                  if (fixedItem != 0.0) {                      
                      vec4 mixedColor = vec4( mix(sColor.rgb, fColor.rgb, stroke), alpha * vColor.a - stroke + fColor.a);
                                                                                    
                      gl_FragColor = mixedColor;
                      
                      //vec2 st = gl_FragCoord.xy; 
                      //float d = distance(vUV, vec2(.5, .5));                      
                      //if(d > 0.46) fColor = sColor;
                  } else {                                                
                      if (tType == 0.0) {
                        gl_FragColor = fColor;
                      } else if (tType == 1.0) {
                        gl_FragColor = vec4(fColor.rgb, fColor.a * vColor.a);
                      }
                  }                                   
              }
           }`
        ].join("\n");
    };

    static circlePickVertexShader() {
        return [
            `precision highp float;
           
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float zoomLevel;
           attribute vec3 position;
           attribute vec3 vertexPos;
           attribute vec3 color;
           attribute vec3 idcolor;     // only used for raycasting
           attribute float alpha;
           attribute float radius;
           varying vec3 vIdColor;
           
           void main() {
                vIdColor = idcolor;
                
                vec4 mvPosition = modelViewMatrix * vec4(vertexPos, 1.0);
                        
                mvPosition.xyz += position * radius * zoomLevel;
   
                gl_Position = projectionMatrix * mvPosition;
           }`
        ].join("\n");
    };

    static circlePickFragmentShader() {
        return [
            `precision highp float;
           varying vec3 vIdColor;
                 
           void main() {        
               gl_FragColor = vec4(vIdColor, 1.0);
           }`
        ].join("\n");
    };

    static circleHoverVertexShader() {
        return [
            `precision highp float;
           
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float zoomLevel;
           attribute vec3 position;
           attribute vec3 vertexPos;
           attribute float radius;
           attribute vec2 uv;
           attribute float type;
           varying vec2 vUV;
           varying float blurType;
           
           void main() {                
                vec4 mvPosition = modelViewMatrix * vec4(vertexPos, 1.0);
                vUV = uv;
                blurType = type;
                              
                mvPosition.xyz += position * radius * zoomLevel;
   
                gl_Position = projectionMatrix * mvPosition;
           }`
        ].join("\n");
    };

    static circleHoverFragmentShader() {
        return [
            `precision highp float;
           varying vec2 vUV;
           varying float blurType;
           uniform vec3 hoveredColor;          
           uniform vec3 selectedColor;
           uniform vec3 directColor;
           uniform vec3 reverseColor;
           float domain[2];
           float range[2];               
                          
           float linearAlpha ( float distance ) {
             domain[0] = 0.30;
             domain[1] = 0.50;
             range[0] = 1.0;
             range[1] = 0.0;       
             
             return range[0] + (range[1] - range[0]) * ((distance - domain[0]) / (domain[1] - domain[0]));
           }
                 
           void main() {                                                        
               vec2 st = gl_FragCoord.xy;
               float d = distance(vUV, vec2(.5, .5));
               float lAlpha = linearAlpha(d);
               vec3 color;
                 
               if (blurType == 0.0) {
                   color = selectedColor;
               }
               
               if (blurType == 1.0) {
                   color = hoveredColor;
               }
               
               if (blurType == 2.0) {
                   color = directColor;
               }
               
               if (blurType == 3.0) {
                   color = reverseColor;
               }            

               if (d < 0.30) gl_FragColor = vec4(color, 1.0);
               else gl_FragColor = vec4(color, lAlpha);
           
           }`
        ].join("\n");
    };

    static lineVertexShader() {
        return [
            `precision highp float;
               
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float linewidth;
		       uniform vec2 resolution;
		       uniform float scaleFactor;
		       uniform float pixelRatio;
		       attribute vec3 instanceStart;
		       attribute vec3 instanceEnd;
		       attribute vec3 instanceColorStart;
		       //attribute vec3 instanceColorEnd;
		       attribute float alphaStart;
		       //attribute float alphaEnd;
		       attribute float widthStart;
		       //attribute float widthEnd;
		       attribute vec3 position;
		       //attribute vec2 uv;
		       //attribute vec2 ubc;
		       attribute vec2 uqc;
		       //attribute float vertexIndex;
		       //varying vec2 vUv;
		       varying float alphaTest;		      
		       //varying vec2 vBC;
		       varying vec2 vQC;
		       varying vec3 vColor;		       
		       //varying float idx;
		       varying float aliasingCoef;
           
           void trimSegment( const in vec4 start, inout vec4 end ) {	         
			         
			         // trim end segment so it terminates between the camera plane and the near plane
			         // conservative estimate of the near plane
			         float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			         float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			         float nearEstimate = - 0.5 * b / a;
			         float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			         end.xyz = mix( start.xyz, end.xyz, alpha );
		       }
		               
           void main() {                
               
				        //vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;
				        //alphaTest = ( position.y < 0.5 ) ? alphaStart : alphaEnd;
				        
				        vColor.xyz = instanceColorStart;
				        alphaTest = alphaStart;
				        float aliasing = 0.0;
				        float lengthCoef = 0.0;
				        vec3 positionStart = instanceStart;
				        vec3 positionEnd = instanceEnd;
				        			        
				        if (alphaStart - 2.0 < 0.0) {
		               aliasing = 0.0;
		               alphaTest = alphaStart;
		               lengthCoef = 0.0;
		               positionStart = instanceStart;
		               positionEnd = instanceEnd;
		            } else if (alphaStart - 2.0 < 1.0) {
		               aliasing = 1.0;
		               alphaTest = alphaStart - 2.0;
		               lengthCoef = 1.0;
		               positionStart = vec3(instanceStart.x - lengthCoef, instanceStart.yz);
		            } else if (alphaStart - 3.0 <= 1.0) {
		               aliasing = 2.0;
		               alphaTest = alphaStart - 3.0;
		               lengthCoef = 2.0;
		               positionEnd = vec3(instanceEnd.x + lengthCoef, instanceEnd.yz);
		            } else if (alphaStart - 5.0 <= 1.0) {
		               aliasing = 3.0;
		               alphaTest = alphaStart - 5.0;
		               lengthCoef = 3.0;
		               positionStart = vec3(instanceStart.xy - lengthCoef, instanceStart.z);
		               positionEnd = vec3(instanceEnd.xy + lengthCoef, instanceEnd.z);
		            }
				          
				        aliasingCoef = aliasing;
			         
                // Pure aspect makes line endings placed on angles which is slightly different
                // from 90 degrees, current coef is an empirical value which is fix it
                // Value is different for retina/non retina displays
                float correctionCoef = pixelRatio == 2.0 ? 0.070 : 0.064;
			          float aspect = (resolution.x / resolution.y) - correctionCoef;
			          //vUv = uv;

			          // camera space	          
			          vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			          vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			          // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			          // clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			          // but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			          // perhaps there is a more elegant solution -- WestLangley

			          bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			          if (perspective) {
				            if (start.z < 0.0 && end.z >= 0.0) {
					              trimSegment( start, end );
				            } else if (end.z < 0.0 && start.z >= 0.0) {
					              trimSegment( end, start );
				            }
			          }

			          // clip space
			          vec4 clipStart = projectionMatrix * start;
			          vec4 clipEnd = projectionMatrix * end;

			          // ndc space
			          vec2 ndcStart = clipStart.xy / clipStart.w;
			          vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			          // direction
			          vec2 dir = ndcEnd - ndcStart;

			          // account for clip-space aspect ratio
			          dir.x *= aspect;
			          dir = normalize( dir );

			          // perpendicular to dir
			          vec2 offset = vec2( dir.y, - dir.x );
			          			         
			          // undo aspect ratio adjustment
			          dir.x /= aspect;
			          offset.x /= aspect;

			          // sign flip
			          if ( position.x < 0.0 ) offset *= - 1.0;

			          // endcaps, to round line corners
			          if ( position.y < 0.0 ) {
				           // offset += - dir;
			          } else if ( position.y > 1.0 ) {
				           // offset += dir;
			          }
			                    
			          float actualWidth = linewidth * widthStart * scaleFactor;
			          
			          // Adjustment for the cases when camera to far and lines becomes hardly visible, 2.35 - optimal visible width
			          float minValue = 2.35 / pixelRatio;
			          
			          if (actualWidth < minValue) {
			              actualWidth = minValue;
			          }

			          // adjust for linewidth
			          offset *= actualWidth;

			          // adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			          offset /= resolution.y;

			          // select end
			          vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			          // back to clip space
			          offset *= clip.w;

			          clip.xy += offset;

			          gl_Position = clip;

			          vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation
			          
			          //vBC = ubc;
			          
			          //idx = vertexIndex;
			          
			          vQC = uqc;
			   			        
           }`
        ].join("\n");
    };

    static lineFragmentShader() {
        return [
            `#extension GL_OES_standard_derivatives : enable

           precision highp float;         
           uniform vec3 diffuse;
		       uniform float opacity;
		       uniform float scaleFactor;
		       //varying vec2 vUv;
		       varying float alphaTest;
		       //varying vec2 vBC;
		       varying vec2 vQC;
		       varying vec3 vColor;
           //varying float idx;
           varying float aliasingCoef;
                           
           float edgeFactor(){
               vec4 d = fwidth(vec4(vQC, 1.0-vQC));
               vec4 a2 = smoothstep(vec4(0.0), d*1.5, vec4(vQC, 1.0-vQC));
    
               //return min(min(min(a2[0], a2[1]), a2[2]), a2[3]);  
    
               if (aliasingCoef == 0.0) {
                   return min(min(min(a2[0], a2[1]), a2[2]), a2[3]);
               } else if (aliasingCoef == 1.0) {
                   return min(min(a2[0], a2[1]), a2[3]);
               } else if (aliasingCoef == 2.0) {
                   return min(min(a2[0], a2[2]), a2[3]);
               } else if (aliasingCoef == 3.0) {
                   return min(a2[0], a2[2]);
               }
           }
                 
           void main() {                   
             //if ( abs( vUv.y ) > 1.0 ) {
				         //float a = vUv.x;
				         //float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				         //float len2 = a * a + b * b;

				         //if ( len2 > 1.0 ) discard;
			       //}
		       
			       gl_FragColor = vec4 (vColor.rgb,  edgeFactor()* alphaTest);
			       
           }`
        ].join("\n");
    };

    static linePickVertexShader() {
        return [
            `precision highp float;
           
           	#include <common>
		        #include <color_pars_vertex>
		        #include <fog_pars_vertex>
		        #include <logdepthbuf_pars_vertex>
		        #include <clipping_planes_pars_vertex>
           
           uniform float linewidth;
		       uniform vec2 resolution;
		       uniform float scaleFactor;
		       attribute vec3 instanceStart;
		       attribute vec3 instanceEnd;
		       attribute vec3 instanceColorStart;
		       attribute vec3 instanceColorEnd;
		       attribute float alphaStart;
		       attribute float alphaEnd;
		       attribute float widthStart;
		       attribute float widthEnd;
		       attribute vec3 instanceColorId;
		       varying vec2 vUv;
		       varying float alphaTest;
		       varying vec4 vColorTest;
           
           void trimSegment( const in vec4 start, inout vec4 end ) {
			         
			         // trim end segment so it terminates between the camera plane and the near plane
			         // conservative estimate of the near plane
			         float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			         float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			         float nearEstimate = - 0.5 * b / a;
			         float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			         end.xyz = mix( start.xyz, end.xyz, alpha );
		       }
           
           void main() {                
                #ifdef USE_COLOR
				            vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;
				            alphaTest = ( position.y < 0.5 ) ? alphaStart : alphaEnd;
				            vColorTest = vec4(instanceColorId, 1.0);
			          #endif

                // Pure aspect makes line endings placed on angles which is slightly different
                // from 90 degrees, current coef is an empirical value which is fix it
                float correctionCoef = 0.065;
			          float aspect = (resolution.x / resolution.y) - correctionCoef;
			          vUv = uv;

			          // camera space
			          vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			          vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			          // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			          // clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			          // but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			          // perhaps there is a more elegant solution -- WestLangley

			          bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			          if (perspective) {
				            if (start.z < 0.0 && end.z >= 0.0) {
					              trimSegment( start, end );
				            } else if (end.z < 0.0 && start.z >= 0.0) {
					              trimSegment( end, start );
				            }
			          }

			          // clip space
			          vec4 clipStart = projectionMatrix * start;
			          vec4 clipEnd = projectionMatrix * end;

			          // ndc space
			          vec2 ndcStart = clipStart.xy / clipStart.w;
			          vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			          // direction
			          vec2 dir = ndcEnd - ndcStart;

			          // account for clip-space aspect ratio
			          dir.x *= aspect;
			          dir = normalize( dir );

			          // perpendicular to dir
			          vec2 offset = vec2( dir.y, - dir.x );
			          			         
			          // undo aspect ratio adjustment
			          dir.x /= aspect;
			          offset.x /= aspect;

			          // sign flip
			          if ( position.x < 0.0 ) offset *= - 1.0;

			          // endcaps, to round line corners
			          if ( position.y < 0.0 ) {
				           // offset += - dir;
			          } else if ( position.y > 1.0 ) {
				           // offset += dir;
			          }

			           float actualWidth = linewidth * widthStart * scaleFactor;
			          
			          // Adjustment for the cases when camera to far and lines becomes hardly visible
			          if (actualWidth < 1.0) {
			              actualWidth = 1.0;
			          }
			          
			          // adjust for linewidth
			          offset *= actualWidth;

			          // adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			          offset /= resolution.y;

			          // select end
			          vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			          // back to clip space
			          offset *= clip.w;

			          clip.xy += offset;

			          gl_Position = clip;

			          vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation
			          
			          #include <logdepthbuf_vertex>
			          #include <clipping_planes_vertex>
			          #include <fog_vertex>
           }`
        ].join("\n");
    };

    static linePickFragmentShader() {
        return [
            `precision highp float;
           
           #include <common>
		       #include <color_pars_fragment>
		       #include <fog_pars_fragment>
		       #include <logdepthbuf_pars_fragment>
		       #include <clipping_planes_pars_fragment>
           
           uniform vec3 diffuse;
		       uniform float opacity;
		       varying vec2 vUv;
		       varying float alphaTest;
		       varying vec4 vColorTest;
		       varying float vLineDistance;
                 
           void main() {                   
             #include <clipping_planes_fragment>
             
             if ( abs( vUv.y ) > 1.0 ) {
				         float a = vUv.x;
				         float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				         float len2 = a * a + b * b;

				         if ( len2 > 1.0 ) discard;
			       }

			       vec4 diffuseColor = vec4( diffuse, alphaTest );
			       
			       #include <logdepthbuf_fragment>
			       #include <color_fragment>
			       
			       gl_FragColor = vColorTest;
			       
			       #include <premultiplied_alpha_fragment>
			       #include <tonemapping_fragment>
			       #include <encodings_fragment>
			       #include <fog_fragment>
           }`
        ].join("\n");
    };

    static arrowVertexShader() {
        return [
            `precision highp float;
           
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float scaleFactor;
           uniform float pixelRatio;
           attribute vec3 position;
           attribute vec3 ubc;
           attribute vec3 vertexPos;
           attribute vec3 color;
           attribute float alpha;
           attribute float xAngle;
           attribute float yAngle;
           attribute float xScale;
           attribute float yScale;
           attribute float arrowIndex;
           varying vec4 vColor;
           varying vec3 vBC;
           varying float aIndex;
           
           // transforms the 'positions' geometry with instance attributes
           vec3 transform( inout vec3 position, vec3 T) {
   
                // Adjustment for the cases when camera to far and lines becomes hardly visible, 
                // 2.35 - optimal visible width for line, 2.35 * 1.5 = 3.525 - adjustment for xScale, 3.525 * 2 = 7.05 - adjustment for yScale
                float scaleCoef = xScale * scaleFactor;
                float minValue = 3.525 / pixelRatio;
                
                if (scaleCoef < minValue) {
                    position.x *= minValue;
                    position.y *= (minValue*2.0);
                } else {
                    position.x *= xScale;
                    position.y *= yScale;
                }
                 
                position *= scaleFactor;                             
   
                // Rotate the position
                vec3 rotatedPosition = vec3(
                   position.x * yAngle + position.y * xAngle,
                   position.y * yAngle - position.x * xAngle, 0);
               
                position = rotatedPosition + T;
               
                // return the transformed position
                return position;
           }
           
           void main() {                
                vec3 pos = position;
                vColor = vec4(color, alpha);
                
                // transform it
                transform(pos, vertexPos);
   
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                
                vBC = ubc;
                
                aIndex = arrowIndex;
           }`
        ].join("\n");
    };

    static arrowFragmentShader() {
        return [
            `#extension GL_OES_standard_derivatives : enable
           
           precision highp float;
           varying vec4 vColor;
           varying vec3 vBC;
           varying float aIndex;
           
           // https://web.archive.org/web/20190220052115/http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
           float edgeFactor(){
               vec3 d = fwidth(vBC);
               vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBC);
               
               if (aIndex > 0.67 && aIndex < 1.33) {
                   return min(a3.y, a3.z);
               }
               
               return min(min(a3.x, a3.y), a3.z);
           }
                 
           void main() {     
             gl_FragColor = vec4(vColor.rgb, edgeFactor() * vColor.a);                          
           }`
        ].join("\n");
    };

    static arrowPickVertexShader() {
        return [
            `precision highp float;
           
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float scaleFactor;
           attribute vec3 position;
           attribute vec3 vertexPos;
           attribute vec3 color;
           attribute vec3 idcolor;
           attribute float alpha;
           attribute float xAngle;
           attribute float yAngle;
           attribute float xScale;
           attribute float yScale;
           varying vec4 vColor;
           
           // transforms the 'positions' geometry with instance attributes
           vec3 transform( inout vec3 position, vec3 T) {
   
                position.x *= xScale;
                position.y *= yScale;
                position *= scaleFactor;
   
                // Rotate the position
                vec3 rotatedPosition = vec3(
                   position.x * yAngle + position.y * xAngle,
                   position.y * yAngle - position.x * xAngle, 0);
               
                position = rotatedPosition + T;
               
                // return the transformed position
                return position;
           }
           
           void main() {                
                vec3 pos = position;
                vColor = vec4(idcolor, 1.0);
                
                // transform it
                transform(pos, vertexPos);
   
                gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
           }`
        ].join("\n");
    };

    static arrowPickFragmentShader() {
        return [
            `precision highp float;
           varying vec4 vColor;
                 
           void main() {                    
             gl_FragColor = vColor;
           }`
        ].join("\n");
    };

    static sectorVertexShader() {
        return [
            `precision highp float;
           
           uniform mat4 modelViewMatrix;
           uniform mat4 projectionMatrix;
           uniform float zoomLevel;
           uniform vec3 staticColor;
           uniform vec3 dynamicColor;
           uniform vec2 resolution;
           attribute vec3 position;
           attribute vec3 vertexPos;
           attribute float radius;
           attribute vec2 uv;
           attribute vec2 angles;         
           varying vec4 vColor;
           varying vec4 dColor;
           varying vec2 vUV;
           varying vec2 cAngles;
           
           void main() {                
                vec4 mvPosition = modelViewMatrix * vec4(vertexPos, 1.0);

                mvPosition.xyz += position * radius;
                
                gl_Position = projectionMatrix * mvPosition;
                
                vColor = vec4(staticColor, 1.0);
                dColor = vec4(dynamicColor, 1.0);
                vUV = uv;
                cAngles = angles;
               
           }`
        ].join("\n");
    };

    static sectorFragmentShader() {
        return [
            `#extension GL_OES_standard_derivatives : enable
           
           precision highp float;
           varying vec4 vColor;
           varying vec4 dColor;
           varying vec2 vUV;
           varying vec2 cAngles;
           
           float circle(vec2 coord, vec2 center, float radius) {
               float distanceToCenter = distance(coord, center);
                            
               return smoothstep(distanceToCenter - 2., distanceToCenter, radius);            
           }
           
           bool isAngleBetween(float target, float angle1, float angle2) {
               float startAngle = min(angle1, angle2);
               float endAngle = max(angle1, angle2);
               
               if (endAngle - startAngle < 0.1) {
                 return false;
               }
               
               target = mod((360. + (mod(target, 360.))), 360.);
               startAngle = mod((3600000. + startAngle), 360.);
               endAngle = mod((3600000. + endAngle), 360.);
               
               if (startAngle < endAngle) return startAngle <= target && target <= endAngle;
               return startAngle <= target || target <= endAngle;
           }

           float sector(vec2 coord, vec2 center, float startAngle, float endAngle) {
             vec2 uvToCenter = coord - center;
             float angle = degrees(atan(uvToCenter.y, uvToCenter.x));
             
             if (isAngleBetween(angle, startAngle, endAngle)) {
               return 1.0;
             } else {
               return 0.;
             }
           }
                 
           void main() {                    
             vec2 coord = vUV;
             vec2 center = vec2(0.0);
             float isCircle = circle(coord, center, 0.5);
             float distanceToCenter = distance(coord, center);
             float delta = fwidth(distanceToCenter);
             float alpha = 1.0 - smoothstep(0.5 - delta, 0.5, distanceToCenter);
             float isSector = sector(coord, center, cAngles[0], cAngles[1]);
             
             if (isSector == 1.0) {
                 gl_FragColor = dColor * alpha;
             } else if (isCircle == 1.0) {
                 gl_FragColor = vColor * alpha;
             }                      
           }`
        ].join("\n");
    };
}

export default Shaders;

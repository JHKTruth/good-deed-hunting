'use strict';

angular.module('goodDeedHuntingApp')
  .factory('Earth', function ($http) {

    var globe = {geom: {}, pos: {}},
        memWorker = new Worker("/workers/members.js"),
        philoGLInit;

    memWorker.addEventListener('message', function(e) {
      console.info("Eservice memWorker received message ", e);

      var modelInfo = e.data;

      globe.members = new O3D.Model(Object.create(modelInfo, {
        pickable: {
          value: true
        },
        //Add a custom picking method
        pick: {
          value: function(pixel) {
            //calculates the element index in the array by hashing the color values
            if (pixel[0] == 0 && (pixel[1] != 0 || pixel[2] != 0)) {
              var index = pixel[2] + pixel[1] * 256;
              return index;
            }
            return false;
          }
        },
        render: {
          value: function(gl, program, camera) {
            gl.drawElements(gl.TRIANGLES, this.$indicesLength, gl.UNSIGNED_SHORT, 0);
          }
        }
      }));
      
      retObj.updateGlobe();
    }, false);

    memWorker.addEventListener('error', function(e) {
      console.error(e);
    }, false);

    function rotateXY(phi, theta) {
      var earth = globe.earth,
          members = globe.members,
          xVec = [1, 0, 0],
          yVec = [0, 1, 0],
          yVec2 =[0, -1, 0];

      earth.matrix = globe.geom.matEarth.clone();
      members.matrix = globe.geom.matMembers.clone();

      var m1 = new Mat4(),
          m2 = new Mat4();

      m1.$rotateAxis(phi, xVec);
      m2.$rotateAxis(phi, xVec);

      m1.$mulMat4(earth.matrix);
      m1.$mulMat4(members.matrix);

      var m3 = new Mat4(),
          m4 = new Mat4();

      m3.$rotateAxis(theta, yVec2);
      m4.$rotateAxis(theta, yVec);

      m1.$mulMat4(m3);
      m2.$mulMat4(m4);

      earth.matrix = m1;
      members.matrix = m2;
    }

    function initPhiloGL() {
      if(!philoGLInit) {
        PhiloGL.unpack();
        Scene.PICKING_RES = 1;
        philoGLInit = true;
      }
    }

    var retObj = {

      createGlobe: function (membersData) {
        console.info("Earth Service Data ", membersData);

        initPhiloGL();
        globe.membersData = membersData;
        memWorker.postMessage(membersData); //process the members info and then have it invoke updateGlobe
      },

      updateGlobe: function () {
        
        var membersData = globe.membersData;

        globe.earth = new O3D.Sphere({
          nlat: 150,
          nlong: 150,
          radius: 1,
          uniforms: {
            shininess: 32
          },
          textures: ['/assets/images/lala.jpg'],
          program: 'earth'
        });

        globe.earth.rotation.set(Math.PI, 0,  0);
        globe.earth.update();

        PhiloGL('gdGlobe', {
          program: [
            {
              //to render the globe
              id: 'earth',
              from: 'uris',
              path: '/assets/shaders/globe/',
              vs: 'earth.vs.glsl',
              fs: 'earth.fs.glsl',
              noCache: true
            }, 
            {
              //to render cities and routes
              id: 'layer',
              from: 'uris',
              path: '/assets/shaders/globe/',
              vs: 'layer.vs.glsl',
              fs: 'layer.fs.glsl',
              noCache: true
            },
            {
              //for glow post-processing
              id: 'glow',
              from: 'uris',
              path: '/assets/shaders/globe/',
              vs: 'glow.vs.glsl',
              fs: 'glow.fs.glsl',
              noCache: true
            }
          ],
          camera: {
            position: {
              x: 0, y: 0, z: -5.125
            }
          },
          scene: {
            lights: {
              enable: true,
              ambient: {
                r: 0.4,
                g: 0.4,
                b: 0.4
              },
              points: {
                diffuse: {
                  r: 0.8,
                  g: 0.8,
                  b: 0.8
                },
                specular: {
                  r: 0.9,
                  g: 0.9,
                  b: 0.9
                },
                position: {
                  x: 2,
                  y: 2,
                  z: -4
                }
              }
            }
          },

          textures: {
            src: ['/assets/images/lala.jpg']
          },

          events: {
            picking: true,
            centerOrigin: false,

            onDragStart: function(e) {
              var pos = globe.pos;

              pos.x = e.x;
              pos.y = e.y;
              pos.started = true;

              globe.geom.matEarth = globe.earth.matrix.clone();
              globe.geom.matMembers = globe.members.matrix.clone();
            },

            onDragMove: function(e) {
              var pos = globe.pos,
                  y = -(e.y - pos.y) / 100,
                  x = (e.x - pos.x) / 100;

              rotateXY(y, x);
            },

            onDragEnd: function(e) {
            },
          },

          onError: function() {
            console.error("There was an error creating the app.", arguments);
          },

          onLoad: function(app) {
            //Unpack app properties
            var gl = app.gl,
                scene = app.scene,
                camera = app.camera,
                canvas = app.canvas,
                width = canvas.width,
                height = canvas.height,
                program = app.program,
                clearOpt = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;

            gl.clearColor(0.1, 0.1, 0.1, 1);
            gl.clearDepth(1);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);

            //create shadow, glow and image framebuffers
            app.setFrameBuffer('world', {
              width: 1024,
              height: 1024,
              bindToTexture: {
                parameters : [ {
                  name : 'TEXTURE_MAG_FILTER',
                  value : 'LINEAR'
                }, {
                  name : 'TEXTURE_MIN_FILTER',
                  value : 'LINEAR',
                  generateMipmap : false
                } ]
              },
              bindToRenderBuffer: true
            }).setFrameBuffer('world2', {
              width: 1024,
              height: 1024,
              bindToTexture: {
                parameters : [ {
                  name : 'TEXTURE_MAG_FILTER',
                  value : 'LINEAR'
                }, {
                  name : 'TEXTURE_MIN_FILTER',
                  value : 'LINEAR',
                  generateMipmap : false
                } ]
              },
              bindToRenderBuffer: true
            });

            //picking scene
            scene.add(globe.earth, globe.members);

            draw();

            //Draw to screen
            function draw() {
              // render to a texture
              gl.viewport(0, 0, width, height);

              program.earth.use();
              program.earth.setUniform('renderType',  0);
              app.setFrameBuffer('world', true);
              gl.clear(clearOpt);
              scene.renderToTexture('world');
              app.setFrameBuffer('world', false);

              program.earth.use();
              program.earth.setUniform('renderType',  -1);
              app.setFrameBuffer('world2', true);
              gl.clear(clearOpt);
              scene.renderToTexture('world2');
              app.setFrameBuffer('world2', false);

              Media.Image.postProcess({
                fromTexture: ['world-texture', 'world2-texture'],
                toScreen: true,
                program: 'glow',
                width: 1024,
                height: 1024
              });

              Fx.requestAnimationFrame(draw);
            }
          }

        });

      }

    };

    return retObj;

  });

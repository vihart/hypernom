# hypernom
Nom all the cells of each 4d platonic solid, by mapping your head rotations to S^3. 

Hypernom is a virtual reality game. The cells of a regular 4D polytope are radially projected to S^3, the sphere in 4D space, then stereographically projected to 3D space where they are viewed in the headset. The orientation of the headset is given by an element of SO(3), a space which is double covered by S^3. In fact, the headset outputs a point of this double cover: a unit quaternion. The positions of the cells are multiplied by this quaternion before projection to 3D space, which moves the player through S^3. When the player is sufficiently close to a cell, they eat it. The aim of the game is to eat all of the cells of the polytope, which, roughly speaking, is achieved by moving one's head through all possible orientations, twice.

Read our related paper here: http://m.archive.bridgesmathart.org/2015/bridges2015-387.pdf
Hypernom in the Bridges Math Art 2015 exhibit: http://gallery.bridgesmathart.org/exhibitions/2015-bridges-conference/hypernom

## Useful commands 

- go to menu: ```tap``` or ```click```
- fullscreen: ```tap``` or ```click```
- move to next polytope: ```space```
- quaternion rotation: ```i j k l u o``` or ```headset rotation in webVR``` or ```mobile device rotation```
- 'normal' rotation: ```w a s d q e```
- translation: ```arrow keys```, ```/``` and ```'```
- show/hide scoring: ```h```
- reset to home screen: ```r```
- switch between stereo and mono: ```tab```

--------------------

By Vi Hart, Andrea Hawksley, and Henry Segerman, using Marc ten Bosch's 4D graphics shader, Mozilla's webVR stuff, and threejs.

- http://vihart.com
- http://andreahawksley.com
- http://www.segerman.org/
- http://www.marctenbosch.com
- https://github.com/MozVR/vr-web-examples/tree/master/threejs-vr-boilerplate
- http://threejs.org

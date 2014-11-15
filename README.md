lsys
====

L-system explorer in JavaScript (Should work on at least moderately new Firefox and Chrome, please report if it does not work for you)

Personal utility for exploring L-systems, for finding parameters that could be
used to procedurally generate some stuff, like maps for freeciv or dungeons for
some roguelikes or something similar.

Features:
  * Seed entry
  * Number of iterations entry
  * Rules entry
  * Supports probabilistic rules
  * Context sensitive/multichar rules *(only tests immediate neughborhood, theres a space for improvement, as per [this paper](http://algorithmicbotany.org/papers/abop/abop-ch1.pdf)*
  * Display generated string
  * Customizable interpreteation of string characters, "turtle graphics" and more, multiple functions per character
  * Drawing by customized interpretation
  * Quite some functions to bind to characters *(more planned)*
  * Angle and length parameters for turtle graphics (length used in other places too)
  * Image download
  * Get all parameters as JSON string
  * Set all parameters in on go from JSON string
  * example selection *(collection will probably grow)*
  * panning *(zooming might be added too)*

View/try it on github [pages](https://morphles.github.io/lsys/index.html).

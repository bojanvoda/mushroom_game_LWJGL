class ShaderProgramManager { // Globally available shader programs
    constructor() {
        this.standardProgram = null;            // Draw static point in the middle
        this.globalDrawingProgram = null;       // Draw point defined by global parameters
    }
}

var Shader = new ShaderProgramManager();        // Create shader program manager

var a_Position = null;

function CreateShaderPrograms(gl) {

    // Draw point at x = 0, y = 0, z = 0
    var v = 'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1); gl_PointSize = 10.0; }';
    var f = 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }'; // Red
    Shader.standardProgram = InitializeShader(gl, v, f);

    // Draw a point at an arbitrary location, determined globally by the JavaScript application
    v = 'attribute vec4 a_Position; void main() { gl_Position = a_Position; gl_PointSize = 10.0; }';
    f = 'void main() { gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); }'; // Green
    Shader.globalDrawingProgram = InitializeShader(gl, v, f);
}

var shaders = [ // Enumerate shader filenames
    "standard",         // this assumes "standard.vs" & "standard.frag" are available in "shaders" directory
    "global"            // this assumes "global.vs" & "global.frag" are available in "shaders" directory
];

var shader_name = [ // Enumerate shader program names
    "standardProgram",
    "globalDrawingProgram"
];

// Scroll through the list, loading shader pairs
function CreateShadersFromFile( gl ) {
    for (i in shaders)
        LoadShader(gl, shader_name[i], shaders[i] + ".vs", shaders[i] + ".frag",
            i // pass in the index of the currently loading shader,
              // this way we can determine when last shader has finished loading
        );
}

function LoadShader(gl, shaderName, filenameVertexShader, filenameFragmentShader, index)
{
    // Folder where your shaders are located
    var ShaderDirectory = "shaders";

    var filename_vs = ShaderDirectory + "/" + filenameVertexShader;
    var filename_fs = ShaderDirectory + "/" + filenameFragmentShader;

    var v = ""; // Placeholders for the shader pair
    var f = "";

    $.ajax( { // Load the vertex shader
        url : filename_vs, type : "POST",
        success : function( msg ) {

            v = msg;

            $.ajax( { // Load the corresponding fragment shader
                url : filename_fs,  type : "POST",
                success : function( msg ) {

                    f = msg;

                    console.log("Initializing Shader Program: " + filename_vs + ", " + filename_fs);

                    Shader[ shaderName ] = InitializeShader(gl, v, f);

                    // Is this the last shader in the queue?
                    // If so, execute "all shaders loaded" event

                    if (index == shaders.length - 1)
                        window.webGLResourcesLoaded();
                }
            });
        }
    });
}

function InitializeShader(gl, source_vs, source_frag)
{
    //console.log("InitializeShader(...)");

    var shader_vs = gl.createShader(gl.VERTEX_SHADER);
    var shader_frag = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shader_vs, source_vs);
    gl.shaderSource(shader_frag, source_frag);

    gl.compileShader(shader_vs);
    gl.compileShader(shader_frag);

    var error = false;

    // Compile vertex shader
    if (!gl.getShaderParameter(shader_vs, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader_vs));
        error = true;
    }

    // Compile fragment shader
    if (!gl.getShaderParameter(shader_vs, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader_vs));
        error = true;
    }

    // Create shader program consisting of shader pair
    program = gl.createProgram();

    // Attach shaders to the program; these methods do not have a return value
    gl.attachShader(program, shader_vs);
    gl.attachShader(program, shader_frag);

    // Link the program - returns 0 if an error occurs
    if (gl.linkProgram(program) == 0) {
        console.log("gl.linkProgram(program) failed with error code 0.");
        error = true;
    }

    if (error)  {
        console.log('Failed to initialize shader.');
        return false;
    } else {
        console.log('Shader successfully created.');
        return program; // Return created program
    }
}
# Simkey App

The Simkey App allows you to conveniently run Simkey scripts. Check out the documentation [available on our website](https://simkey.wiki) to learn the language.

## Using the Simkey App

First create a `.simkey` file with a basic script. We will be using this file for our demonstration (calling it `abc.simkey`):

```simkey
<SETTINGS> # This will be read by the app when loading #
    name = "My First App!"

<MACRO>
    abc # Clicks a,b,c and releases #
```

### Getting the File to Load

Save this script under `abc.simkey` and press the `Load` button (in the bottom strip) in the app. This will open an explorer window for you to choose the script. Once loaded, you should notice that it is named `My First App!`, with the path to the file located under that. 

Here's the load button, location, and name circled and how the app should currently look:

![Loaded File](/images/loaded.png)

Now press the `Select` button you find under the script name and location. You should see the `Configure` section enable and light up, and notice that now the `Run` and `Save` buttons are enabled:

![Configure Section](/images/configure.png)

You can exit out of this by clicking the `X` next to the name on the `Configure` section.

In the configure section, you can add a shortcut, how many times you want the script to repeat (number, `ON`, or `OFF` which is the same as 1), which `MODE` is selected when compiling, and which `SWITCHES` are on when compiling. 

To open the file with its default editor, you can click the `Open` button in the script's box. Clicking `Remove` will remove it from the app, and will not delete the actual file.

Whenever you make a change to the file, this will not be automatically registered in the app, as it runs off of already compiled files. In order to get it to recompile, press the reload button on the right of each script's name.

### Testable Example (Autoclicker)

With the previous example, it is hard to test the effects yourself. When you click `Run` or use a shortcut, the script instantly executes and there is no where for `abc` to be written. We will be using a different example, which is making a simple autoclicker:

```simkey
<SETTINGS>
    name = "My Autoclicker!"

<MACRO>
    [MB_LEFT]<25>
```

Follow the steps above in order to get here:

![Autoclicker Loaded](/images/autoclicker.png)

This time, we will configure a shortcut for ease of use. Go ahead and press `Select`, then set the shortcut in the configure section to `F6`. Set the `Repeat` to `ON`, as we want this to only stop when you click the shortcut. Finally, click `Save`.

![Configured Autoclicker](/images/saved_autoclicker.png)

To test this, go to a click speed test website, such as [CPSRace](https://www.cpsrace.com), and give it a go with the shortcut!

**NOTE:** When setting a `shortcut` or adjusting the `repeat`, the app **automatically saves when you press enter or click off the input**. However, **when changing `modes` and `switches`, the script must be recompiled, so you must press `Save`**.

### Utilities (`Utils` Button)

The final thing is the `Utils`. You can click the `Utils` button in the bottom right, and a window should open.

This currently only has one button which you can click to track where your mouse goes. By pressing enter while not having clicked off the `Utilities` window, you can click the button and have it stop to record where your cursor was (can be helpful for `@cursor`). We plan to add more helpful `utilities` later on.

### Setting Up Highlighting

If you use VS Code, you can download the `Simkey Highlighter` extension from the marketplace. You can also visit the [simkey-vscode GitHub repository to download releases from there](https://github.com/border-l/simkey-vscode).
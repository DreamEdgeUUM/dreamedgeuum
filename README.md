**HOW TO DEPLOY**

First of all here the structure of the file:
/DreamEdge
-app.py
--static (scripts.js, style.css)
--dataset (profile.json/csv, statements.json/csv, video.json/csv, comments.json.csv)

Secondly, you need to download this file through ur computer.
After download this file, you need to put it in the directory which you need to recognize the path (or you can copy the path from the directory)
For example, you keep this file (DreamEdge) in your Documents path, so the path will be like this: C:\Users\Documents\EdgeDream.

Then, open CMD run as administrator.
in CMD command this:
cd <<your path of the directory contains this project's file>>

After the command, it will lead to the location of the file then prompt this:
python app.py

//simple reminder, you need to install python in your computer before run this prompt.

after run, the cmd will provide localhost link like http://127.0.0.1:5000/ or something like that. so, you can use it to run it in chrome or any other platform.

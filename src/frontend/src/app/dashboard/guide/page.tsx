import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';





export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-xl font-bold text-center mb-6">User Guide for Python Code Running Platform</h1>
      <h2 className="text-lg font-semibold mb-4">Overview</h2>
      <p className="mb-6">
        This platform allows users to execute Python code by uploading a zip file containing their input data. Each
        execution environment is set up with a pre-defined structure consisting of your main script (`main.py`) and two
        directories (`input` and `output`) to manage data and results.
      </p>
      <h2 className="text-lg font-semibold mb-4">File Structure</h2>
      <p className="mb-6">Upon execution, the user's environment will be structured as follows:</p>
      <ul className="list-disc ml-5 mb-6">
        <li>
          <code>main.py</code>: The main Python script where your code will be executed.
        </li>
        <li>
          <code>input/</code>: A directory where the contents of your uploaded zip file will be extracted.
        </li>
        <li>
          <code>output/</code>: A directory where you can store output files generated by your code.
        </li>
      </ul>
      <img src="/assets/code.png" alt="" />
      <h2 className="text-lg font-semibold mb-4">Accessing Input Files</h2>
      <h3 className="text-md font-semibold mb-2">Step 1: Import the os Module</h3>
      <p className="mb-4">
        Start by importing the <code>os</code> module at the beginning of your <code>main.py</code> script:
      </p>
      <pre className="bg-gray-200 p-2 my-2">
        <code>import os</code>
      </pre>
      <h3 className="text-md font-semibold mb-2">Step 2: Get the Current Working Directory</h3>
      <p className="mb-4">
        Use <code>os.getcwd()</code> to get the path to the current working directory where <code>main.py</code>,{' '}
        <code>input</code>, and <code>output</code> are located:
      </p>
      <pre className="bg-gray-200 p-2 my-2">
        <code>current_dir = os.getcwd()</code>
      </pre>
      <h3 className="text-md font-semibold mb-2">Step 3: Construct Path to the Input Folder</h3>
      <p className="mb-4">
        Append <code>/input</code> to the <code>current_dir</code> to form the path to the input directory:
      </p>
      <pre className="bg-gray-200 p-2 my-2">
        <code>input_dir = os.path.join(current_dir, 'input')</code>
      </pre>
      <h3 className="text-md font-semibold mb-2">Step 4: Access Files Within the Input Folder</h3>
      <p className="mb-6">
        Now you can use <code>input_dir</code> to access files within the <code>input</code> folder. For example, to
        list all files in the <code>input</code> directory:
      </p>
      <pre className="bg-gray-200 p-2 my-2">
        <code>input_files = os.listdir(input_dir)</code>
      </pre>
      <pre className="bg-gray-200 p-2 my-2">
        <code>print("Input files:", input_files)</code>
      </pre>
      To read a specific file (e.g., <code>data.txt</code>):
      <pre className="bg-gray-200 p-2 my-2">
        <code>file_path = os.path.join(input_dir, 'data.txt')</code>
      </pre>
      <pre className="bg-gray-200 p-2 my-2">
        <code>with open(file_path, 'r') as file: </code>
      </pre>
      <pre className="bg-gray-200 p-2 my-2">
        <code> data = file.read() </code>
      </pre>
      <pre className="bg-gray-200 p-2 my-2">
        <code> print(data)</code>
      </pre>
      <h2 className="text-lg font-semibold mb-4">Storing Output Files</h2>
      <p className="mb-6">
        To store files in the <code>output</code> directory, you can follow a similar process to construct the path to
        the <code>output</code> folder and write files to it:
      </p>
      <pre className="bg-gray-200 p-2 my-2">
        <code>output_dir = os.path.join(current_dir, 'output')</code>
      </pre>
      <pre className="bg-gray-200 p-2 my-2">
        <code>output_file_path = os.path.join(output_dir, 'result.txt')</code>
      </pre>
      <p className="text-center font-medium mt-10">
        This guide outlines how to access input data and store output results within your script on our Python code
        running platform. By following these instructions, you can ensure that your code correctly interacts with the
        provided file structure.
      </p>
    </div>
  );
}

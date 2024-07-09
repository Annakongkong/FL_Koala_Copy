import os
import shutil
import subprocess
import traceback
import zipfile


class ExecutionDisposable:
    def __init__(self, base_dir, exec_id):
        self.has_input = False
        self.base_dir = base_dir
        self.unique_folder = os.path.join(self.base_dir, str(exec_id))
        self.input_folder = os.path.join(self.unique_folder, "input")
        self.output_folder = os.path.join(self.unique_folder, "output")
        self.script_path = os.path.join(self.unique_folder, "main.py")
        self.python_path = "python"

    @staticmethod
    def secure_filename(filename):
        return os.path.basename(filename)

    @staticmethod
    def unzip(zip_file, extract_folder):
        with zipfile.ZipFile(zip_file, "r") as zipf:
            zipf.extractall(extract_folder)
            print("Files extracted successfully.")

    def __run_script(self) -> bool:
        script_path = self.script_path
        log_file_path = os.path.join(self.unique_folder, "script.log")

        try:
            with open(log_file_path, "w") as log_file:
                # Execute the script and redirect stdout and stderr to the log file
                result = subprocess.run(
                    [self.python_path, script_path],
                    cwd=self.unique_folder,
                    stdout=log_file,
                    stderr=subprocess.STDOUT,
                    timeout=60,
                    check=True,
                )
            return True

        except subprocess.CalledProcessError as e:
            # If there's a process error, log it directly to the file
            with open(log_file_path, "a") as log_file:
                log_file.write(f"Script error: {e}\n")
            return False

        except Exception as e:
            # Log other exceptions, including the traceback
            with open(log_file_path, "a") as log_file:
                log_file.write(f"Execution error: {e}\n")
                traceback.print_exc(file=log_file)
            return False

    def prepare_input(self, original_zip_path):
        # copy from temp folder to input folder and rename to input.zip
        zip_path = os.path.join(self.input_folder, "input.zip")
        shutil.copy(original_zip_path, zip_path)
        os.remove(original_zip_path)
        if os.path.exists(zip_path):
            self.unzip(zip_path, self.input_folder)
            os.remove(zip_path)

    def prepare_script(self, script_path):
        # copy from script folder to unique folder and rename to main.py
        shutil.copy(script_path, self.script_path)

    def prepare_script_by_code(self, code):
        # create a new file in the unique folder and write the code to it
        with open(self.script_path, "w") as file:
            file.write(code)

    def package_output(self):
        # Create a ZIP file of the output directory
        output_zip_path = os.path.join(self.unique_folder, "output.zip")
        # zip output folder directly
        with zipfile.ZipFile(output_zip_path, "w") as zipf:
            for dirpath, dirnames, filenames in os.walk(self.output_folder):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    parentpath = os.path.relpath(filepath, self.unique_folder)
                    zipf.write(filepath, parentpath)
        return output_zip_path

    def run(
        self,
        script_path=None,
        input_zip_path=None,
        script_code=None,
        download_output=False,
        executable_python=None,
    ) -> tuple[bool, str]:
        output_zip = None
        if script_code and script_path:
            raise ValueError("Cannot provide both script path and script code.")
        self.__prepare_folders()
        if input_zip_path:
            self.prepare_input(input_zip_path)
        if script_code:
            self.prepare_script_by_code(script_code)
        else:
            self.prepare_script(script_path)
        if executable_python:
            self.python_path = executable_python
        success = self.__run_script()
        if download_output:
            output_zip = self.package_output()
            print(f"Output packaged at {output_zip}")
        if success:
            print("Script execution successful.")
        else:
            print("Script execution failed.")
        shutil.rmtree(self.input_folder, ignore_errors=True)
        shutil.rmtree(self.output_folder, ignore_errors=True)
        return success, output_zip

    def __prepare_folders(self):
        os.makedirs(self.input_folder)
        os.makedirs(self.output_folder)


# NOTE when executing each script, each user will have a unique folder to execute the script in.
# current working directory is the unique folder.
# Each folder has "input" and "output" folders.
# Input folder contains a zip file called "input.zip" with the input files.
# server will unzip "input.zip" in the input folder. no new folder will be created.
# User must place new files needed to download in the output folder.
# Server will zip the output folder and send it to the user.
# Output folder is where the output files will be stored.

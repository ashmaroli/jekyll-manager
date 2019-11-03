# frozen_string_literal: true

describe "theme" do
  include Rack::Test::Methods

  def app
    JekyllAdmin::Server
  end

  before(:each) do
    JekyllAdmin.site.process
  end

  after(:each) do
    JekyllAdmin.site.process
  end

  context "index" do
    let(:theme) { last_response_parsed }
    let(:directories) do
      theme["directories"]
    end
    let(:sample_directory) { directories[2] }

    it "lists theme metadata" do
      get "/theme"
      expect(last_response).to be_ok
      expect(last_response_parsed["name"]).to eq("test-theme")
      expect(last_response_parsed["version"]).to eq("0.1.0")
      expect(last_response_parsed["authors"]).to eq("Jekyll")
      expect(last_response_parsed["license"]).to eq("MIT")
    end

    it "lists theme directories" do
      theme_dirs = %w(assets _includes _layouts _sass)
      get "/theme"
      expect(last_response).to be_ok
      expect(directories.map { |d| d["name"] }.sort!).to eq(theme_dirs.sort)
    end

    it "doesn't include the directory contents" do
      get "/theme"
      expect(last_response).to be_ok
      expect(sample_directory).to_not have_key("content")
      expect(sample_directory).to_not have_key("raw_content")
    end
  end

  context "getting a single theme directory" do
    it "returns the requested directory" do
      expected = {
        "name"     => "default.html",
        "extname"  => ".html",
        "api_url"  => "http://example.org/_api/theme/_layouts/default.html",
        "http_url" => nil,
      }
      get "/theme/_layouts"
      expect(last_response).to be_ok
      expect(last_response_parsed["name"]).to eq("_layouts")
      expect(last_response_parsed["entries"].first).to eq(expected)
    end

    it "returns subdirectories" do
      expected = {
        "name"     => "icon-dark.png",
        "extname"  => ".png",
        "http_url" => "http://example.org/assets/images/icon-dark.png",
        "api_url"  => "http://example.org/_api/theme/assets/images/icon-dark.png",
      }
      get "/theme/assets/images"
      expect(last_response).to be_ok
      expect(last_response_parsed["entries"].first).to eq(expected)
    end
  end

  context "getting a theme file" do
    it "returns the raw content" do
      expected = "<!DOCTYPE html>\n<html>\n  <head>\n"
      get "/theme/_layouts/default.html"
      expect(last_response).to be_ok
      expect(last_response_parsed["name"]).to eq("default.html")
      expect(last_response_parsed["raw_content"]).to include(expected)
    end

    it "404s for an unknown page" do
      get "/theme/_layouts/foo.html"
      expect(last_response.status).to eql(404)
    end
  end

  it "copies a theme-file to source directory" do
    delete_file "_includes/include.html"

    put "/theme/_includes/include.html"

    expect(last_response).to be_ok
    expect("_includes/include.html").to be_an_existing_file

    delete_file "_includes/include.html"
  end
end

# frozen_string_literal: true

describe "dashboard" do
  include Rack::Test::Methods

  def app
    JekyllAdmin::Server
  end

  it "returns the modified site payload" do
    get "/dashboard"
    expect(last_response).to be_ok
    expect(last_response_parsed["site"]["posts"]).to eql(
      [
        "2016-01-01-test-post.md",
        "2016-02-01-test-post-2.md",
        "2016-03-01-test-post-3.md",
        "more posts/2016-04-01-post-within-subdirectory.md",
        "more posts/some more posts/2016-05-01-a-test-post-within-subdirectory.md",
        "more posts/some more posts/2016-05-02-another-test-post-within-subdirectory.md",
        "test/2016-01-02-test2.md",
      ].sort
    )
    expect(last_response_parsed["site"]["content_pages"]).to eql(
      [
        "page.md",
        "page-dir/page1.md",
        "page-dir/test/page2.md",
      ].sort
    )
    expect(last_response_parsed["site"]["data_files"]).to eql(
      [
        "template-config.yaml",
        "data_file.yml",
        "movies/actors.yml",
        "movies/genres/fiction.yml",
        "settings.json",
        "members.csv",
      ].sort
    )
    expect(last_response_parsed["site"]["static_files"]).to eql(
      [
        "/assets/images/icon-github.svg",
        "/assets/images/jekyll-logo-light-solid.png",
        "/assets/scripts/script.js",
        "/assets/static-file.txt",
        "/index.html",
        "/static-file.txt",
        "/assets/images/icon-dark.png",
      ].sort
    )
    expect(last_response_parsed["site"]["drafts"]).to eql(
      [
        "draft-dir/WIP/yet-another-draft-post.md",
        "draft-dir/another-draft-post.md",
        "draft-post.md",
      ].sort
    )
    expect(last_response_parsed["site"]["collections"]).to eql(%w(posts puppies))
  end
end

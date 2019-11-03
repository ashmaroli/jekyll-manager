# frozen_string_literal: true

module JekyllAdmin
  class Server < Sinatra::Base
    namespace "/dashboard" do
      get do
        json app_meta.merge!(
          "site" => dashboard_site_payload
        )
      end

      private

      def app_meta
        {
          "jekyll" => {
            "version"     => Jekyll::VERSION,
            "environment" => Jekyll.env,
          },
          "admin"  => {
            "version"     => JekyllManager::VERSION,
            "environment" => ENV["RACK_ENV"],
          },
        }
      end

      # rubocop:disable Metrics/AbcSize
      def dashboard_site_payload
        {
          "health"          => site_health,
          "layouts"         => site.layouts.keys.sort,
          "tags"            => site.tags.keys.sort,
          "content_pages"   => to_html_pages,
          "data_files"      => DataFile.all.map(&:relative_path).sort,
          "static_files"    => site.static_files.map(&:relative_path).sort,
          "collections"     => site.collection_names.sort,
          "drafts"          => paths_to_drafts.sort,
          "collection_docs" => collection_documents.flatten.sort,
          "templates"       => presentational_files.flatten.sort,
        }.merge! site_docs
      end
      # rubocop:enable Metrics/AbcSize

      def to_html_pages
        site.pages.select(&:html?).map!(&:path).sort
      end

      def collection_documents
        cols = site.collections.clone
        cols.delete("posts")
        cols.map { |c| c[1].filtered_entries }
      end

      def site_docs
        site.collections.map { |c| [c[0], c[1].filtered_entries.sort] }.to_h
      end

      def paths_to_drafts
        site.posts.docs.select { |post| post.output_ext == ".html" && post.draft? }
          .map! { |post| post.relative_path.sub("_drafts/", "") }
      end

      def presentational_files
        %w(_layouts _includes _sass assets).map do |dname|
          Dir["#{site.in_source_dir(dname)}/**/*"]
            .reject { |entry| File.directory?(entry) }
            .reject { |item| site.static_files.map(&:path).include?(item) }
            .map { |fpath| fpath.sub("#{site.source}/", "") }
        end
      end

      def site_health
        output = capture_output do
          @healthy = Jekyll::Commands::Doctor.healthy?(site)
        end
        output = "I, #{Time.now} : Everything looks fine." if output.empty?

        { "is_healthy" => @healthy }.merge! logger_to_hash(output)
      end

      def capture_output
        buffer = StringIO.new
        Jekyll.logger = Logger.new(buffer)
        yield
        buffer.rewind
        buffer.string
      end

      def logger_to_hash(message)
        stack = message.split(", ")
        log_level = level_label(stack.shift)

        msg = stack.join(", ").squeeze(" ").split(": ")
        msg.shift
        msg = msg.join(": ").delete("\n")

        {
          "report_lvl" => log_level,
          "report_txt" => msg,
        }
      end

      # base on non-halting Jekyll logger level methods
      def level_label(level_id)
        case level_id
        when "E" then "error"
        when "W" then "warn"
        else "info"
        end
      end
    end
  end
end
